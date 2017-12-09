import * as d3 from 'd3'
import * as moment from 'moment'
import * as _ from 'lodash'
import drawFloor from './drawFloor'
import centralize from './centralize'
import { getColor } from '../../utils/utils'
import { TrackMapProp } from './TrackMap'

type Padding = {
  top: number
  bottom: number
  left: number
  right: number
}

function showTooltip(
  tooltipWrapper: d3.Selection<HTMLDivElement>,
  trackPoint: TrackPoint,
  transform: d3.ZoomTransform,
  humanize: HumanizeFn
) {
  let durationText = '<p style="margin:0">经过</p>'
  if (trackPoint.duration > 0) {
    durationText = `<p style="margin:0">停留${(trackPoint.duration / 60e3).toFixed(1)}分钟</p>`
  }
  const x = transform.applyX(trackPoint.x) - transform.x
  const y = transform.applyY(trackPoint.y) - transform.y
  // language=TEXT
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

function hideTooltip(tooltipWrapper: d3.Selection<HTMLDivElement>) {
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
  private svgElement: SVGSVGElement
  private svg: d3.Selection<SVGElement, {}, null, null>
  private zoom = d3.zoom()
  private focusedItemId = -1
  private tooltipWrapper: d3.Selection<HTMLDivElement, null, null, null>
  private getProps: () => TrackMapProp
  private humanize: (mac: string) => string
  private onChangeHtid: (trackId: number) => void
  private onChangeHtpid: (trackPointId: number) => void

  // 第一次绘制地图的时候自动缩放, 后续绘制地图就不需要自动缩放了
  needAutoResetTransform = true

  constructor(svgElement: SVGSVGElement, tooltipWrapperElement: HTMLDivElement, getProps: () => TrackMapProp) {
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
        onZoom()
      })
    this.svg.call(this.zoom)
  }

  // destroy() {
  //   todo 释放资源, 清空回调函数
  // }

  updateFloor(floor: Floor) {
    drawFloor(floor, this.svgElement)
    if (this.needAutoResetTransform) {
      this.resetTransform(false)
      this.needAutoResetTransform = false
    }
  }

  updateTrackPoints(tracks: Track[], { htid, htpid, showMembers }: Partial<TrackMapProp>) {
    const self = this
    const board = this.svg.select('.board')
    const trackPointsLayer = board.select('.track-points-layer')

    const trackPointsOpacity = (track: Track) => {
      if (htid === null || track.trackId === htid) {
        return 0.8
      } else {
        return 0.2
      }
    }

    // 每条track 一个g.track
    const trackPointsJoin = trackPointsLayer.selectAll('.track')
      .data(tracks, (track: Track) => String(track.trackId))
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
      raw: d3.symbol().type(d3.symbolCircle).size(125),
      'track-end': d3.symbol().type(d3.symbolTriangle).size(800),
    }
    const symbolGenerator = (trackPoint: TrackPoint) => symbolMap[trackPoint.pointType]()
    const trackPointTransform = ({ x, y, trackPointId }: TrackPoint) => {
      const scale = trackPointId === htpid ? 3 : 1
      return `translate(${x}, ${y}) scale(${scale})`
    }

    // 每个track-point一个symbol 和一个member-group
    const symbolsJoin = trackPoints.selectAll('.symbol')
      .data(track => track.points, (trackPoint: TrackPoint) => String(trackPoint.trackPointId))
    const symbols = symbolsJoin.enter()
      .append('path')
      .classed('symbol', true)
      .style('cursor', 'pointer')
      .attr('data-track-point-id', trackPoint => trackPoint.trackPointId)
      .attr('fill', ({ mac }) => getColor(mac))
      .merge(symbolsJoin)
    symbolsJoin.exit().remove()
    symbols
      .attr('transform', trackPointTransform)
      .attr('d', symbolGenerator)
      .on('mouseenter', ({ trackPointId }) => this.onChangeHtpid(trackPointId))
      .on('mouseleave', () => this.onChangeHtpid(null))
      .on('click', function onClickSymbol(this: SVGPathElement) {
        const { trackId } = d3.select(this.parentElement).datum() as Track
        const { htid } = self.getProps()
        self.onChangeHtid(trackId === htid ? null : trackId)
      })

    if (showMembers) {
      const memberGroupsJoin = trackPoints.selectAll('.member-group')
        .data(track => track.points, (trackPoint: TrackPoint) => String(trackPoint.trackPointId))
      const memberGroups = memberGroupsJoin.enter()
        .append('g')
        .classed('member-group', true)
        .attr('data-track-point-id', trackPoint => trackPoint.trackPointId)
        .merge(memberGroupsJoin)
        .attr('opacity', ({ trackPointId }) => (trackPointId === htpid ? 1 : 0.6))
      memberGroupsJoin.exit().remove()

      const membersJoin = memberGroups.selectAll('circle')
        .data(point => point.members)
      const members = membersJoin.enter()
        .append('circle')
        .attr('cx', m => m.x)
        .attr('cy', m => m.y)
        .attr('fill', '#ff5722')
        .style('pointer-events', 'none')
        .attr('r', 8)
      members.exit().remove()
    } else {
      trackPoints.selectAll('.member-group').remove()
    }

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

  updateTrackPath(tracks: Track[], { htid }: Partial<TrackMapProp>) {
    const board = this.svg.select('.board')
    const trackPathLayer = board.select('.track-path-layer')

    const opacity = (track: Track) => {
      if (htid === null || track.trackId === htid) {
        return 0.8
      } else {
        return 0.2
      }
    }
    const lineGenerator = d3.line<TrackPoint>()
      .x(item => item.x)
      .y(item => item.y)
      .curve(d3.curveCardinal.tension(0.7))


    // 每一条轨迹(track)对应一个path
    const trackPathJoin = trackPathLayer.selectAll('path')
      .data(tracks, (track: Track) => String(track.trackId))
    const trackPath = trackPathJoin.enter()
      .append('path')
      .attr('fill', 'none')
      .style('cursor', 'pointer')
      .attr('data-track-id', track => track.trackId)
      .attr('stroke', track => getColor(track.mac))
      .attr('stroke-width', 8)
      .merge(trackPathJoin)
      .attr('opacity', opacity)
      .attr('d', track => lineGenerator(track.points))
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

  updateLocationItems(locationItems: LocationItem[], { showNoise }: Partial<TrackMapProp>) {
    const board = this.svg.select('.board')
    const itemsLayer = board.select('.items-layer')
    if (showNoise) {
      const itemsJoin = itemsLayer.selectAll('circle')
        .data(locationItems, (item: LocationItem) => String(item.id))
      const items = itemsJoin.enter()
        .append('circle')
        .attr('cx', item => item.x)
        .attr('cy', item => item.y)
        .attr('r', 8)
        .merge(itemsJoin)
      itemsJoin.exit().remove()
    } else {
      itemsLayer.selectAll('circle').remove()
    }
  }

  updateTracks(tracks: Track[], { showPath, showPoints, showMembers, htid, htpid }: Partial<TrackMapProp>) {
    if (showPoints) {
      this.updateTrackPoints(tracks, { htid, htpid, showMembers })
    } else {
      this.clearTrackPoints()
    }
    if (showPath) {
      this.updateTrackPath(tracks, { htid })
    } else {
      this.clearTrackPath()
    }
  }

  centralizeTrack(track: Track) {
    const pathElement = this.svgElement.querySelector(`.track-path-layer path[data-track-id="${track.trackId}"]`) as SVGPathElement
    const contentBox = pathElement.getBBox()
    this.centralize(contentBox, true, { top: 200, bottom: 200, left: 600, right: 600 })
  }

  resetTransform(useTransition = true) {
    const regionsLayerWrapper = this.svg.select('.regions-layer-wrapper').node() as SVGGElement
    const contentBox = regionsLayerWrapper.getBBox()
    this.centralize(contentBox, useTransition, { top: 50, bottom: 50, left: 450, right: 300 })
  }

  centralize(contentBox: SVGRect, useTransition: boolean, padding: Padding) {
    const targetTransform = centralize(contentBox, {
      width: this.svgElement.clientWidth,
      height: this.svgElement.clientHeight,
    }, padding)
    if (targetTransform) {
      this.zoom.transform(useTransition
        ? d3.select(this.svgElement).transition()
        : d3.select(this.svgElement) as any,
        targetTransform,
      )
    }
  }
}
