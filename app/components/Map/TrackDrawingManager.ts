import * as d3 from 'd3'
import * as moment from 'moment'
import { noop } from 'redux-saga/utils'
import { getColor, getTrackPoints } from '../../utils/utils'
import { TrackMapProp } from './TrackMap'
import DrawingManager from './DrawingManager'
import { Range, Track, TrackPoint } from '../../interfaces'

const trackPointsSymbolMap = {
  'track-start': d3.symbol().type(d3.symbolSquare).size(10),
  normal: d3.symbol().type(d3.symbolCircle).size(10),
  raw: d3.symbol().type(d3.symbolCircle).size(3),
  'track-end': d3.symbol().type(d3.symbolTriangle).size(10),
}

//#region tooltip
function showTooltip(
  tooltipWrapper: d3.Selection<HTMLDivElement>,
  trackPoint: TrackPoint,
  transform: d3.ZoomTransform,
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
      <p style="margin: 0">${trackPoint.trackName}</p>
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

//#endregion

export default class TrackDrawingManager extends DrawingManager {
  private svg: d3.Selection<SVGElement>
  private tooltipWrapper: d3.Selection<HTMLDivElement>
  private getProps: () => TrackMapProp

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

    this.zoom.on('zoom.tooltip', () => {
      this.tooltipWrapper
        .style('left', `${d3.event.transform.x}px`)
        .style('top', `${d3.event.transform.y}px`)
    })
  }

  private highlightSemanticTrackPoint = ({ trackPointId }: TrackPoint) => {
    this.getProps().onChangeSid(trackPointId)
  }

  drawTrackPoints(
    tracks: Track[],
    pointsLayer: d3.Selection,
    onClick: (trackPoint: TrackPoint) => void,
    range: Range,
  ) {
    const allTrackPoints = getTrackPoints(tracks)
    const intersection = (point: TrackPoint) => {
      const { start: s1, end: e1 } = range
      const s2 = point.time
      const e2 = point.time + point.duration
      return !(s1 > e2 || e1 < s2)
    }
    const highlightedTrackPoints = new Set(allTrackPoints.filter(intersection).map(p => p.trackPointId))

    const pointGroupsJoin = pointsLayer.selectAll('.track-points')
      .data(tracks, (track: Track) => String(track.trackId))
    const pointGroups = pointGroupsJoin.enter()
      .append('g')
      .classed('track-points', true)
      .attr('data-track-id', track => String(track.trackId))
      .merge(pointGroupsJoin)
    // .attr('opacity', pointsGroupOpacity)
    pointGroupsJoin.exit().remove()

    const symbolGenerator = (trackPoint: TrackPoint) => trackPointsSymbolMap[trackPoint.pointType]()
    const trackPointTransform = ({ x, y }: TrackPoint) => `translate(${x}, ${y})`

    const trackPointOpacity = ({ trackPointId }: TrackPoint) => (highlightedTrackPoints.has(trackPointId) ? 1 : 0.2)

    // 每个track-point一个symbol
    const symbolsJoin = pointGroups.selectAll('.symbol')
      .data(track => track.points, (trackPoint: TrackPoint) => String(trackPoint.trackPointId))
    const symbols = symbolsJoin.enter()
      .append('path')
      .classed('symbol', true)
      .style('transition', 'opacity 100ms')
      .attr('data-track-point-id', trackPoint => trackPoint.trackPointId)
      .attr('fill', ({ trackName }) => getColor(trackName))
      .merge(symbolsJoin)
    symbols
      .attr('transform', trackPointTransform)
      .attr('opacity', trackPointOpacity)
      .attr('d', symbolGenerator)
    if (onClick) {
      symbols.on('click', onClick || noop)
        .style('cursor', 'pointer')
    }
    symbolsJoin.exit().remove()
  }

  private drawTrackPaths(
    tracks: Track[],
    pathLayer: d3.Selection,
    range: Range,
  ) {
    // const opacity = (track: Track) => {
    //   const inThisTrack = track.startTime <= time && time <= track.endTime
    //   return (time === 0 || inThisTrack) ? 0.8 : 0.1
    // }

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
      .attr('stroke', track => getColor(track.trackName))
      .attr('stroke-width', 0.5)
      .attr('d', track => lineGenerator(track.points))
      .merge(trackPathJoin)
      // .attr('opacity', opacity)

    trackPathJoin.exit().remove()
  }

  updateRawTracks(rawTracks: Track[], range: Range) {
    const board = this.svg.select('.board')
    const pointsLayer = board.select('.raw-tracks-wrapper .points-layer') as d3.Selection
    const pathLayer = board.select('.raw-tracks-wrapper .path-layer') as d3.Selection

    this.drawTrackPoints(rawTracks, pointsLayer, null, range)
    this.drawTrackPaths(rawTracks, pathLayer, range)
  }

  updateSemanticTracks(semanticTracks: Track[], range: Range) {
    const board = this.svg.select('.board')
    const pointsLayer = board.select('.semantic-tracks-wrapper .points-layer') as d3.Selection
    const pathLayer = board.select('.semantic-tracks-wrapper .path-layer') as d3.Selection

    this.drawTrackPoints(semanticTracks, pointsLayer, this.highlightSemanticTrackPoint, range)
    this.drawTrackPaths(semanticTracks, pathLayer, range)
  }
}
