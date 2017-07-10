/* eslint-disable no-shadow,no-param-reassign */
import * as d3 from 'd3'
import moment from 'moment'
import _ from 'lodash'
import drawFloor from './drawFloor'
import centralize from './centralize'
import { getColor } from '../../utils/utils'

function showTooltip(tooltipWrapper, trackPoint, transform, humanize) {
  let durationText = '<p style="margin:0">经过</p>'
  if (trackPoint.duration > 0) {
    durationText = `<p style="margin:0">停留${(trackPoint.duration / 60e3).toFixed(1)}分钟</p>`
  }
  const x = transform.applyX(trackPoint.x) - transform.x
  const y = transform.applyY(trackPoint.y) - transform.y
  tooltipWrapper.html(`
    <div style="left: ${x}px; top: ${y}px;">
      <p style="margin: 0">${humanize(trackPoint.mac)}</p>
      <p style="margin: 0">${moment(trackPoint.time).format('HH:mm:ss')}</p>
      ${durationText}
    </div>
  `).style('display', 'block')
  // .style('opacity', 0.3)
  // .interrupt('hide-tooltip')
  // .transition()
  // .style('opacity', 1)
}

function hideTooltip(tooltipWrapper) {
  // tooltipWrapper.transition('hide-tooltip')
  //   .style('opacity', 0)
  //   .on('end', function end() {
  //     d3.select(this)
  //       .style('opacity', null)
  //       .style('display', 'none')
  //   })
  tooltipWrapper.style('display', 'none')
}

export default class DrawingManager {
  // private svgElement: SVGElement
  // private svg: d3.Selection<SVGElement, {}, null, null>
  // private zoom = d3.zoom()
  // private focusedItemId = -1

  // 第一次绘制地图的时候自动缩放, 后续绘制地图就不需要自动缩放了
  needAutoResetTransform = true

  constructor(svgElement, tooltipWrapperElement, getProps) {
    this.svgElement = svgElement
    this.svg = d3.select(svgElement)
    this.tooltipWrapper = d3.select(tooltipWrapperElement)
    this.zoom = d3.zoom()

    this.getProps = getProps
    const { humanize, onChangeHtid, onChangeHtpid, onZoom } = getProps()
    this.humanize = humanize
    this.onChangeHtid = onChangeHtid
    this.onChangeHtpid = onChangeHtpid

    const board = this.svg.select('.board')
    this.zoom.scaleExtent([0.2, 2])
      .on('zoom', () => {
        const { transform } = d3.event
        board.attr('transform', transform)
        this.tooltipWrapper.style('left', `${d3.event.transform.x}px`)
          .style('top', `${d3.event.transform.y}px`)
        onZoom(transform)
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

  updateTrackPoints(tracks, { htid, htpid }) {
    const self = this
    const board = this.svg.select('.board')
    const trackPointsLayer = board.select('.track-points-layer')

    const trackPointsOpacity = (track) => {
      if (htid === null || track.trackId === htid) {
        return 0.8
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
      .style('cursor', 'pointer')
      .attr('data-track-point-id', trackPoint => trackPoint.trackPointId)
      .attr('transform-origin', 'center center')
      .attr('d', symbolGenerator)
      .attr('fill', ({ mac }) => getColor(mac))
      .merge(symbolsJoin)
      .attr('transform', trackPointTransform)
    symbolsJoin.exit().remove()
    symbols.on('mouseenter', ({ trackPointId }) => this.onChangeHtpid(trackPointId))
      .on('mouseleave', () => this.onChangeHtpid(null))
      .on('click', function onClickSymbol() {
        const { trackId } = d3.select(this.parentElement).datum()
        const { htid } = self.getProps()
        self.onChangeHtid(trackId === htid ? null : trackId)
      })

    // update tooltip
    // htp: highlighted track point
    const htp = _.flatMap(tracks, track => track.points)
      .find(({ trackPointId }) => trackPointId === htpid)
    if (htp) {
      this.tooltipWrapper.call(showTooltip, htp, d3.zoomTransform(this.svgElement), this.humanize)
    } else {
      this.tooltipWrapper.call(hideTooltip)
    }
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
        return 0.8
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
      .style('cursor', 'pointer')
      .attr('data-track-id', track => track.trackId)
      .attr('stroke', track => getColor(track.mac))
      .attr('stroke-width', 8)
      .attr('d', track => lineGenerator(track.points))
      .merge(trackPathJoin)
      .attr('opacity', opacity)
    trackPath.filter(({ trackId }) => trackId === htid)
      .raise()
    trackPathJoin.exit().remove()

    trackPath.on('click', ({ trackId }) => {
      const { htid } = this.getProps()
      if (htid === trackId) {
        this.onChangeHtid(null)
      } else {
        this.onChangeHtid(trackId)
      }
    })
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

  centralizeTrack(track) {
    const pathElement = this.svgElement.querySelector(`.track-path-layer path[data-track-id="${track.trackId}"]`)
    const contentBox = pathElement.getBBox()
    this.centralize(contentBox, true, { top: 50, bottom: 50, left: 300, right: 450 })
  }

  resetTransform(useTransition = true) {
    const regionsLayerWrapper = this.svg.select('.regions-layer-wrapper').node()
    const contentBox = regionsLayerWrapper.getBBox()
    this.centralize(contentBox, useTransition, { top: 50, bottom: 50, left: 300, right: 300 })
  }

  centralize(contentBox, useTransition, padding) {
    const targetTransform = centralize(contentBox, {
      width: this.svgElement.clientWidth,
      height: this.svgElement.clientHeight,
    }, padding)
    if (targetTransform) {
      this.zoom.transform(useTransition
        ? d3.select(this.svgElement).transition()
        : d3.select(this.svgElement),
        targetTransform,
      )
    }
  }
}
