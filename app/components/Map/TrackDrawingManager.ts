import * as d3 from 'd3'
import * as moment from 'moment'
import * as _ from 'lodash'
import { getColor } from '../../utils/utils'
import { TrackMapProp } from './TrackMap'
import DrawingManager from './DrawingManager'

const trackPointsSymbolMap = {
  'track-start': d3.symbol().type(d3.symbolSquare).size(800 / 16),
  normal: d3.symbol().type(d3.symbolCircle).size(500 / 16),
  raw: d3.symbol().type(d3.symbolCircle).size(3),
  'track-end': d3.symbol().type(d3.symbolTriangle).size(800 / 16),
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

export default class TrackDrawingManager extends DrawingManager {
  private svg: d3.Selection<SVGElement>
  private tooltipWrapper: d3.Selection<HTMLDivElement>
  private getProps: () => TrackMapProp
  private humanize: (mac: string) => string

  constructor(
    svgElement: SVGSVGElement,
    tooltipWrapperElement: HTMLDivElement,
    zoom: d3.ZoomBehavior<SVGSVGElement, null>,
    getProps: () => TrackMapProp,
  ) {
    super(svgElement, zoom)
    this.svg = d3.select(svgElement)
    this.tooltipWrapper = d3.select(tooltipWrapperElement)

    this.getProps = getProps
    const { humanize } = getProps()
    this.humanize = humanize

    this.zoom.on('zoom.tooltip', () => {
      this.tooltipWrapper
        .style('left', `${d3.event.transform.x}px`)
        .style('top', `${d3.event.transform.y}px`)
    })
  }

  highlightRawTrack(trackId: number) {
    const { onChangeTime, rawTracks } = this.getProps()
    if (trackId == null) {
      onChangeTime(0)
    } else {
      const track = rawTracks.find(track => (track.trackId === trackId))
      onChangeTime(track.startTime)
    }
  }

  highlightRawTrackPoint = ({ trackPointId }: TrackPoint) => {
    const { onChangeTime, rawTracks } = this.getProps()
    if (trackPointId == null) {
      onChangeTime(0)
    } else {
      const rawTrackPoints = rawTracks.reduce<TrackPoint[]>((result, track) => result.concat(track.points), [])
      const point = rawTrackPoints.find(p => (p.trackPointId === trackPointId))
      onChangeTime(point.time)
    }
  }

  updateTrackPoints(tracks: Track[], pointsLayer: d3.Selection, { time }: Partial<TrackMapProp>) {
    const allTrackPoints = tracks.reduce<TrackPoint[]>((result, tr) => result.concat(tr.points), [])
    const closestPointId = _.minBy(allTrackPoints, p => Math.abs(p.time - time)).trackPointId

    const trackOpacity = (track: Track) => {
      const inThisTrack = track.startTime <= time && time <= track.endTime
      return (time === 0 || inThisTrack) ? 1 : 0.1
    }

    const pointGroupsJoin = pointsLayer.selectAll('.track-points')
      .data(tracks, (track: Track) => String(track.trackId))
    const pointGroups = pointGroupsJoin.enter()
      .append('g')
      .classed('track-points', true)
      .attr('data-track-id', track => String(track.trackId))
      .merge(pointGroupsJoin)
      .attr('opacity', trackOpacity)
    pointGroupsJoin.exit().remove()

    const symbolGenerator = (trackPoint: TrackPoint) => trackPointsSymbolMap[trackPoint.pointType]()
    const trackPointTransform = ({ x, y }: TrackPoint) => `translate(${x}, ${y})`

    const trackPointOpacity = ({ trackPointId }: TrackPoint) => {
      return trackPointId === closestPointId ? 1 : 0.2
    }

    // 每个track-point一个symbol
    const symbolsJoin = pointGroups.selectAll('.symbol')
      .data(track => track.points, (trackPoint: TrackPoint) => String(trackPoint.trackPointId))
    const symbols = symbolsJoin.enter()
      .append('path')
      .classed('symbol', true)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 100ms')
      .attr('data-track-point-id', trackPoint => trackPoint.trackPointId)
      .attr('fill', ({ mac }) => getColor(mac))
      .merge(symbolsJoin)
    symbolsJoin.exit().remove()
    symbols
      .attr('transform', trackPointTransform)
      .attr('opacity', trackPointOpacity)
      .attr('d', symbolGenerator)
      .on('click', this.highlightRawTrackPoint)

    // update tooltip
    // htp: highlighted track point
    // const htp = _.flatMap(tracks, track => track.points)
    //   .find(({ trackPointId }) => trackPointId === htpid)
    // if (htp) {
    //   this.tooltipWrapper.call(showTooltip, htp, d3.zoomTransform(this.svgElement), this.humanize)
    // } else {
    //   this.tooltipWrapper.call(hideTooltip)
    // }
  }

  updateTrackPaths(tracks: Track[], pathLayer: d3.Selection, { time }: Partial<TrackMapProp>) {
    const opacity = (track: Track) => {
      const inThisTrack = track.startTime <= time && time <= track.endTime
      return (time === 0 || inThisTrack) ? 0.8 : 0.1
    }

    const lineGenerator = d3.line<TrackPoint>()
      .x(item => item.x)
      .y(item => item.y)
      .curve(d3.curveCardinal.tension(0.7))


    // 每一条轨迹(track)对应一个path
    const trackPathJoin = pathLayer.selectAll('path')
      .data(tracks, (track: Track) => String(track.trackId))
    const trackPath = trackPathJoin.enter()
      .append('path')
      .attr('fill', 'none')
      .style('cursor', 'pointer')
      .attr('data-track-id', track => track.trackId)
      .attr('stroke', track => getColor(track.mac))
      .attr('stroke-width', 0.5)
      .on('click', ({ trackId }) => this.highlightRawTrack(trackId))
      .attr('d', track => lineGenerator(track.points))
      .merge(trackPathJoin)
      .attr('opacity', opacity)

    trackPathJoin.exit().remove()
  }

  updateRawTracks(rawTracks: Track[], { time }: Partial<TrackMapProp>) {
    const board = this.svg.select('.board')
    const pointsLayer = board.select('.raw-tracks-wrapper .points-layer') as d3.Selection
    const pathLayer = board.select('.raw-tracks-wrapper .path-layer') as d3.Selection

    this.updateTrackPoints(rawTracks, pointsLayer, { time })
    this.updateTrackPaths(rawTracks, pathLayer, { time })
  }

  updateSemanticTracks(semanticTracks: Track[], { time }: Partial<TrackMapProp>) {
    const board = this.svg.select('.board')
    const pointsLayer = board.select('.semantic-tracks-wrapper .points-layer') as d3.Selection
    this.updateTrackPoints(semanticTracks, pointsLayer, { time })
  }

  centralizeRawTrack(track: Track) {
    const cssSelector = `.raw-tracks-wrapper .path-layer path[data-track-id="${track.trackId}"]`
    const pathElement = this.svgElement.querySelector(cssSelector) as SVGPathElement
    const contentBox = pathElement.getBBox()
    this.centralize(contentBox, true, { top: 200, bottom: 200, left: 600, right: 600 })
  }
}
