import * as d3 from 'd3'
import moment from 'moment'
import _ from 'lodash'
import { getColor } from '../../utils/utils'

function distance2(p1, p2) {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
}

function drawFloor(floor, svgElement, zoom) {
  const svg = d3.select(svgElement)

  const board = svg.select('.board')

  zoom.scaleExtent([0.2, 2])
    .on('zoom', () => {
      board.attr('transform', String(d3.event.transform))
      const tooltipWrapper = d3.select('.tooltip-wrapper')
      tooltipWrapper.style('left', `${d3.event.transform.x}px`)
        .style('top', `${d3.event.transform.y}px`)
    })
  svg.call(zoom)

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

  const regions = regionsLayer.selectAll('polygon').data(floor.regions)
  regions.enter().append('polygon')
    .merge(regions)
    .attr('fill', d => floor.config.colors[d.color])
    .attr('points', d => d.points.map(p => `${p.x},${p.y}`).join(' '))
    .attr('stroke', '#cccccc')
    .attr('stroke-width', '1')
  regions.exit().remove()

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
  const texts = textsLayer.selectAll('text').data(getAllLabelConfig())
  texts.enter().append('text')
    .merge(texts)
    .text(d => d.text)
    .attr('x', d => d.config.pos.x)
    .attr('y', d => d.config.pos.y)
    .attr('font-size', d => d.config.fontSize)
  texts.exit().remove()

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

  constructor(svgElement) {
    this.svgElement = svgElement
    this.svg = d3.select(svgElement)
    this.zoom = d3.zoom()
    this.focusedItemId = -1

    // 下面这段代码 "通过在地图上点击鼠标 在控制台打印该点的坐标"
    // const board = this.svg.select('.board').node() as SVGGElement
    // this.svg.on('click', () => {
    //   console.log(d3.mouse(board))
    // })
  }

  updateFloor(floor) {
    drawFloor(floor, this.svgElement, this.zoom)
    if (this.needAutoResetTransform) {
      this.resetTransform(false)
      this.needAutoResetTransform = false
    }
  }

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
    const pathJoin = pathLayer.selectAll('path').data(itemsArray, items => items[0].mac)
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
        hideTooltip()
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
      d3.select('.tooltip-wrapper')
        .html(`
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
      d3.select('.tooltip-wrapper > div')
        .style('left', `${x}px`)
        .style('top', `${y}px`)
    }
  }

  resetTransform(useTransition = true) {
    const padding = {
      left: 250,
      bottom: 100,
      right: 50,
      top: 50,
    }
    const boardElement = this.svgElement.querySelector('.board')
    const contentBox = boardElement.getBBox()
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

}

function hideTooltip() {
  d3.select('.tooltip-wrapper > div')
    .transition()
    .style('opacity', 0)
    .on('end', function end() {
      d3.select(this).style('opacity', null)
        .style('display', 'none')
    })
}
