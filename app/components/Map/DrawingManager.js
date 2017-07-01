/* eslint-disable no-shadow,no-param-reassign */
import * as d3 from 'd3'
import moment from 'moment'
import _ from 'lodash'
import { getColor } from '../../utils/utils'

function distance2(p1, p2) {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
}

// 在svgElement上绘制地图
function drawFloor(floor, svgElement) {
  const svg = d3.select(svgElement)
  const board = svg.select('.board')

  // 绘制region
  const regionsLayerJoin = board.select('.regions-layer-wrapper')
    .selectAll('g').classed('regions-layer', true)
    .data([floor.floorId], _.identity)
  const regionsLayerEnter = regionsLayerJoin.enter()
    .append('g')
    .classed('regions-layer', true)
    .style('opacity', 0)
  regionsLayerEnter.transition()
    .style('opacity', 1)
  regionsLayerJoin.on('end.remove', null)
    .transition()
    .style('opacity', 1)
  regionsLayerJoin.exit()
    .transition()
    .style('opacity', 0)
    .remove()
  const regionsLayer = regionsLayerJoin.merge(regionsLayerEnter)

  const regionsJoin = regionsLayer.selectAll('polygon').data(floor.regions)
  regionsJoin.enter().append('polygon')
    .merge(regionsJoin)
    .attr('fill', d => floor.config.colors[d.color])
    .attr('points', d => d.points.map(p => `${p.x},${p.y}`).join(' '))
    .attr('stroke', '#cccccc')
    .attr('stroke-width', '1')
  regionsJoin.exit().remove()

  // 绘制文本
  const textsLayerJoin = board.select('.texts-layer-wrapper')
    .selectAll('g').classed('texts-layer', true)
    .data([floor.floorId], _.identity)
  const textsLayerEnter = textsLayerJoin.enter()
    .append('g')
    .classed('texts-layer', true)
    .style('opacity', 0)
  textsLayerEnter.transition()
    .style('opacity', 1)
  textsLayerJoin.on('end.remove', null)
    .transition()
    .style('opacity', 1)
  textsLayerJoin.exit()
    .transition()
    .style('opacity', 0)
    .remove()
  const textsLayer = textsLayerJoin.merge(textsLayerEnter)
  const textsJoin = textsLayer.selectAll('text').data(getAllLabelConfig())
  textsJoin.enter().append('text')
    .merge(textsJoin)
    .text(d => d.text)
    .attr('x', d => d.config.pos.x)
    .attr('y', d => d.config.pos.y)
    .attr('font-size', d => d.config.fontSize)
  textsJoin.exit().remove()

  function getAllLabelConfig() {
    const nodes = floor.nodes.filter(node => node.labelConfig && node.labelConfig.show)
    return nodes.map(node => ({
      text: node.name,
      config: node.labelConfig,
    }))
  }
}

export default class DrawingManager {
  // private svgElement: SVGElement
  // private svg: d3.Selection<SVGElement, {}, null, null>
  // private zoom = d3.zoom()
  // private focusedItemId = -1

  // 第一次绘制地图的时候自动缩放, 后续绘制地图就不需要自动缩放了
  needAutoResetTransform = true

  constructor(svgElement, tooltipWrapperElement) {
    this.svgElement = svgElement
    this.svg = d3.select(svgElement)
    this.tooltipWrapper = d3.select(tooltipWrapperElement)
    this.zoom = d3.zoom()
    this.focusedItemId = -1

    const board = this.svg.select('.board')
    this.zoom.scaleExtent([0.2, 2])
      .on('zoom', () => {
        board.attr('transform', String(d3.event.transform))
        this.tooltipWrapper.style('left', `${d3.event.transform.x}px`)
          .style('top', `${d3.event.transform.y}px`)
      })
    this.svg.call(this.zoom)
  }

  // destroy() {
  //   todo 释放资源, 清空回调函数
  // }

  updateFloor(floor) {
    drawFloor(floor, this.svgElement)
    if (this.needAutoResetTransform) {
      this.resetTransform(false)
      this.needAutoResetTransform = false
    }
  }

  // todo 调用raise来提升高亮的track与trackPoint
  updateTrackPoints(tracks, { htid, htpid }) {
    const board = this.svg.select('.board')
    const trackPointsLayer = board.select('.track-points-layer')

    const trackPointsOpacity = (track) => {
      if (htid === null || track.trackId === htid) {
        return 1
      } else {
        return 0.2
      }
    }

    // 每条track 一个g.track
    const trackPointsJoin = trackPointsLayer.selectAll('.track')
      .data(tracks, track => String(track.trackId))
    const trackPoints = trackPointsJoin.enter()
      .append('g')
      .classed('track', true)
      .attr('data-track-id', track => String(track.trackId))
      .merge(trackPointsJoin)
      .attr('opacity', trackPointsOpacity)
    trackPoints
      .filter(({ trackId }) => trackId === htid)
      .raise()
    trackPointsJoin.exit().remove()

    const symbolMap = {
      'track-start': d3.symbol().type(d3.symbolSquare).size(800),
      normal: d3.symbol().type(d3.symbolCircle).size(500),
      'track-end': d3.symbol().type(d3.symbolTriangle).size(800),
    }
    const symbolGenerator = trackPoint => symbolMap[trackPoint.pointType]()
    const trackPointTransform = ({ x, y, trackPointId }) => {
      const scale = trackPointId === htpid ? 3 : 1
      return `translate(${x}, ${y}) scale(${scale})`
    }

    // 每个track-point一个symbol
    const symbolsJoin = trackPoints.selectAll('.symbol')
      .data(track => track.points, trackPoint => trackPoint.trackPointId)
    const symbols = symbolsJoin.enter()
      .append('path')
      .classed('symbol', true)
      .attr('data-track-point-id', trackPoint => trackPoint.trackPointId)
      .attr('transform-origin', 'center center')
      .attr('d', symbolGenerator)
      .attr('fill', ({ mac }) => getColor(mac))
      .merge(symbolsJoin)
      .attr('transform', trackPointTransform)

    symbolsJoin.exit().remove()
  }

  clearTrackPoints() {
    this.svg.select('.board .track-points-layer')
      .selectAll('*')
      .remove()
  }

  updateTrackPath(tracks, { htid }) {
    const board = this.svg.select('.board')
    const trackPathLayer = board.select('.track-path-layer')

    const opacity = (track) => {
      if (htid === null || track.trackId === htid) {
        return 1
      } else {
        return 0.2
      }
    }
    const lineGenerator = d3.line()
      .x(item => item.x)
      .y(item => item.y)
      .curve(d3.curveCardinal.tension(0.7))


    // 每一条轨迹(track)对应一个path
    const trackPathJoin = trackPathLayer.selectAll('path')
      .data(tracks, track => String(track.trackId))
    const trackPath = trackPathJoin.enter()
      .append('path')
      .attr('fill', 'none')
      .attr('data-track-id', track => track.trackId)
      .attr('stroke', track => getColor(track.mac))
      .attr('stroke-width', 8)
      .attr('d', track => lineGenerator(track.points))
      .merge(trackPathJoin)
      .attr('opacity', opacity)
    trackPath.filter(({ trackId }) => trackId === htid)
      .raise()
    trackPathJoin.exit().remove()
  }

  clearTrackPath() {
    this.svg.select('.board .track-path-layer')
      .selectAll('*')
      .remove()
  }

  updateTracks(tracks, { showPath, showPoints, htid, htpid }) {
    if (showPoints) {
      this.updateTrackPoints(tracks, { htid, htpid })
    } else {
      this.clearTrackPoints()
    }
    if (showPath) {
      this.updateTrackPath(tracks, { htid })
    } else {
      this.clearTrackPath()
    }
  }

  /** @deprecated */
  updateItems(items) {
    const self = this
    this.zoom.on('zoom.tooltip', () => {
      if (this.focusedItemId !== -1) {
        updateTooltipPosition(this.focusedItemId)
      }
    })

    const itemsArray = _.values(_.groupBy(items, item => item.mac))
    const radius = 12

    const board = this.svg.select('.board')
    const itemsLayer = board.select('.items-layer')
    const circlesGroupJoin = itemsLayer.selectAll('g')
      .data(itemsArray, items => String(items[0].mac))
    const circlesGroup = circlesGroupJoin.enter()
      .append('g')
      .merge(circlesGroupJoin)
    circlesGroupJoin.exit().remove()

    const circlesJoin = circlesGroup.selectAll('circle')
      .data(items => items, item => String(item.id))
    const circles = circlesJoin.enter()
      .append('circle')
      .attr('transform-origin', 'center center')
      .attr('stroke-width', 6)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 0)
      .attr('data-item-id', d => d.id)
      .transition()
      .attr('r', (d, i) => {
        if (i === 0) {
          return 2 * radius
        } else if (d.duration > 0) {
          return 1.5 * radius
        } else {
          return radius
        }
      })
      .selection()
      .merge(circlesJoin)
    circles.attr('fill', (d, i, g) => (i === g.length - 1 ? 'none' : getColor(d.mac)))
      .attr('stroke', (d, i, g) => (i === g.length - 1 ? getColor(d.mac) : 'none'))
    circlesJoin.exit().remove()

    const line = d3.line()
      .x(item => item.x)
      .y(item => item.y)
      .curve(d3.curveCardinal.tension(0.7))
    const pathLayer = board.select('.path-layer')
    const pathJoin = pathLayer.selectAll('path')
      .data(itemsArray, items => items[0].mac)
    const path = pathJoin.enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', d => getColor(d[0].mac))
      .attr('stroke-width', 8)
      .merge(pathJoin)
    pathJoin.exit().remove()
    path.attr('d', d => line(_.takeRight(d, 20)))

    this.svg.on('mousemove.tooltip', () => {
      const currentTransform = d3.zoomTransform(this.svgElement)
      const x = currentTransform.invertX(d3.event.x)
      const y = currentTransform.invertY(d3.event.y)
      const closestItem = _.minBy(items, item => distance2(item, { x, y }))
      if (closestItem && distance2(closestItem, { x, y })
        < (radius / Math.min(1, currentTransform.k)) ** 2) {
        if (this.focusedItemId !== closestItem.id) {
          blur()
          focus(closestItem.id)
        }
      } else {
        blur()
      }
    })

    function blur() {
      if (self.focusedItemId !== -1) {
        itemsLayer.select(`[data-item-id="${self.focusedItemId}"]`)
          .transition()
          .attr('transform', 'scale(1)')
        self.focusedItemId = -1
        self.hideTooltip()
      }
    }

    function focus(itemId) {
      self.focusedItemId = itemId
      const closestCircle = itemsLayer.select(`[data-item-id="${itemId}"]`)
      closestCircle.raise()
        .transition()
        .attr('transform', 'scale(2)')
      showTooltip(itemId)
    }

    function showTooltip(itemId) {
      const item = items.find(item => (item.id === itemId))
      let durationText = '<p style="margin:0">经过</p>'
      if (item.duration > 0) {
        durationText = `<p style="margin:0">停留${item.duration.toFixed(2)}分钟</p>`
      }
      self.tooltipWrapper.html(`
        <div>
          <p style="margin: 0">${item.mac}</p>
          <p style="margin: 0">${moment(item.time).format('HH:mm:ss')}</p>
          ${durationText}
        </div>
      `)
      updateTooltipPosition(itemId)
    }

    function updateTooltipPosition(itemId) {
      const currentTransform = d3.zoomTransform(self.svgElement)
      const item = items.find(item => (item.id === itemId))
      const x = currentTransform.applyX(item.x) - currentTransform.x
      const y = currentTransform.applyY(item.y) - currentTransform.y
      self.tooltipWrapper.style('left', `${x}px`)
        .style('top', `${y}px`)
    }
  }

  centralizeTrack(track) {
    const pathElement = this.svgElement.querySelector(`.track-path-layer path[data-track-id="${track.trackId}"]`)
    const contentBox = pathElement.getBBox()
    this.centralize(contentBox, true)
  }

  resetTransform(useTransition = true) {
    const boardElement = this.svg.select('.board').node()
    const contentBox = boardElement.getBBox()
    this.centralize(contentBox, useTransition)
  }

  centralize(contentBox, useTransition, padding = {
    left: 150,
    bottom: 150,
    right: 150,
    top: 150,
  }) {
    if (contentBox.width === 0) {
      contentBox.width = 200
      contentBox.x -= 100
    }
    if (contentBox.height === 0) {
      contentBox.height = 200
      contentBox.y -= 100
    }
    if (contentBox.width && contentBox.height) {
      const viewBox = {
        x: padding.left,
        y: padding.top,
        width: this.svgElement.clientWidth - padding.left - padding.right,
        height: this.svgElement.clientHeight - padding.top - padding.bottom,
      }
      const mb = {
        x: contentBox.x,
        y: contentBox.y,
        width: contentBox.width,
        height: contentBox.height,
      }
      const scaleX = viewBox.width / mb.width
      const scaleY = viewBox.height / mb.height
      const scale = _.clamp(Math.min(scaleX, scaleY), 0.2, 2)
      const dx = (viewBox.x + viewBox.width / 2) - (mb.x + mb.width / 2) * scale
      const dy = (viewBox.y + viewBox.height / 2) - (mb.y + mb.height / 2) * scale
      this.zoom.transform(useTransition
          ? d3.select(this.svgElement).transition()
          : d3.select(this.svgElement),
        d3.zoomIdentity.translate(dx, dy).scale(scale))
    }
  }

  hideTooltip() {
    this.tooltipWrapper.transition()
      .style('opacity', 0)
      .on('end', function end() {
        d3.select(this)
          .style('opacity', null)
          .style('display', 'none')
      })
  }
}

