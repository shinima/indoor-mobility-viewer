import * as d3 from 'd3'
import * as moment from 'moment'
import { getColor, getTrackPoints } from '../../utils/utils'
import { TrackMapProp } from './TrackMap'
import DrawingManager from './DrawingManager'
import { Range, Track, TrackPoint, TrackPointType } from '../../interfaces'
import { PlainTrackMap } from '../../reducer'

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

function pointRadius(pointType: TrackPointType) {
  if (pointType === 'raw') {
    return 0.75
  } else if (pointType === 'pass-by') {
    return 1.25
  } else if (pointType === 'stay') {
    return 2
  }
}

function trackPointRadius({ pointType }: TrackPoint) {
  return pointRadius(pointType)
}

export default class TrackDrawingManager extends DrawingManager {
  private svg: d3.Selection<SVGElement>
  private getProps: () => TrackMapProp

  constructor(
    svgElement: SVGSVGElement,
    zoom: d3.ZoomBehavior<SVGSVGElement, null>,
    getProps: () => TrackMapProp,
  ) {
    super(svgElement, zoom)
    this.svg = d3.select(svgElement)
    this.getProps = getProps
  }

  private highlightSemanticTrackPoint = ({ trackPointId }: TrackPoint) => {
    this.getProps().onChangeSid(trackPointId)
  }

  drawRawTrackPoints(
    tracks: Track[],
    pointsLayer: d3.Selection,
    range: Range,
  ) {
    const allPoints = getTrackPoints(tracks)
    const inRange = ({ time }: TrackPoint) => (range.start <= time && time <= range.end)
    const visiblePoints = allPoints.filter(inRange)

    const pointsJoin = pointsLayer.selectAll('circle')
      .data(visiblePoints, (p: TrackPoint) => String(p.trackPointId))
    pointsJoin.enter()
      .append('circle')
      .attr('data-trackpointid', p => p.trackPointId)
      .attr('opacity', 0.8)
      .attr('fill', p => getColor(p.trackName))
      .attr('cx', p => p.x)
      .attr('cy', p => p.y)
      .attr('r', 0)
      .transition()
      .delay((_, i) => 50 * i)
      .attr('r', trackPointRadius)
      .selection()
      .merge(pointsJoin)
    pointsJoin.exit()
      .transition()
      .attr('r', 0)
      .remove()
  }

  drawSemanticTrackPoints(
    semanticTracks: Track[],
    pointsLayer: d3.Selection,
    range: Range,
  ) {
    const allTrackPoints = getTrackPoints(semanticTracks)
    const intersection = (point: TrackPoint) => {
      const { start: s1, end: e1 } = range
      const s2 = point.time
      const e2 = point.time + point.duration
      return !(s1 > e2 || e1 < s2)
    }
    const highlightedTrackPoints = new Set(allTrackPoints.filter(intersection).map(p => p.trackPointId))

    const pointGroupsJoin = pointsLayer.selectAll('.track-points')
      .data(semanticTracks, (track: Track) => String(track.trackId))
    const pointGroups = pointGroupsJoin.enter()
      .append('g')
      .classed('track-points', true)
      .attr('data-track-id', track => String(track.trackId))
      .merge(pointGroupsJoin)
    // .attr('opacity', pointsGroupOpacity)
    pointGroupsJoin.exit().remove()

    const trackPointOpacity = ({ trackPointId }: TrackPoint) => (highlightedTrackPoints.has(trackPointId) ? 0.8 : 0.2)

    // 每个track-point一个symbol
    const symbolsJoin = pointGroups.selectAll('.symbol')
      .data(track => track.points, (trackPoint: TrackPoint) => String(trackPoint.trackPointId))
    const symbols = symbolsJoin.enter()
      .append('rect')
      .classed('symbol', true)
      .style('transition', 'opacity 250ms')
      .attr('data-track-point-id', trackPoint => trackPoint.trackPointId)
      .attr('fill', ({ event }) => getColor(event === 'stay' ? 'semantic-stay' : 'semantic'))
      .on('click', this.highlightSemanticTrackPoint)
      .style('cursor', 'pointer')
      .attr('x', p => p.x - trackPointRadius(p))
      .attr('y', p => p.y - trackPointRadius(p))
      .attr('width', p => 2 * trackPointRadius(p))
      .attr('height', p => 2 * trackPointRadius(p))
      .merge(symbolsJoin)
      .attr('opacity', trackPointOpacity)
    symbolsJoin.exit().remove()
  }

  private drawTrackPaths(
    tracks: Track[],
    pathLayer: d3.Selection,
    strokeWidth: number,
    opacity: number,
    strokeDasharray?: string
  ) {
    const lineGenerator = d3.line<TrackPoint>()
      .x(item => item.x)
      .y(item => item.y)
      .curve(d3.curveCardinal.tension(0.7))


    // 每一条轨迹(track)对应一个path
    const trackPathJoin = pathLayer.selectAll('path')
      .data(tracks, (track: Track) => String(track.trackId))
    const trackPathEnter = trackPathJoin.enter()
      .append('path')
      .attr('fill', 'none')
      .style('cursor', 'pointer')
      .attr('data-track-id', track => track.trackId)
      .attr('stroke', track => getColor(track.trackName))
      .attr('stroke-width', strokeWidth)
      .attr('d', track => lineGenerator(track.points))
      .attr('opacity', opacity)
    if (strokeDasharray) {
      trackPathEnter.attr('stroke-dasharray', strokeDasharray)
    } else {
      trackPathEnter
        .attr('stroke-dasharray', (track, i, arr) => {
          const element = arr[i] as SVGPathElement
          return `0 ${element.getTotalLength()}`
        })
        .transition()
        .duration(2000)
        .attr('stroke-dasharray', (_, i, arr) => {
          const element = arr[i] as SVGPathElement
          return `${element.getTotalLength()} 0`
        })
    }

    trackPathJoin.exit().remove()
  }

  updatePlainTrackMap(plainTrackMap: PlainTrackMap, range: Range) {
    const wrapper = this.svg.select('.board .plain-track-map-wrapper')

    for (const [trackName, tracks] of Object.entries(plainTrackMap)) {
      const pointsLayer = wrapper.select(`.${trackName} .points-layer`) as d3.Selection
      const pathLayer = wrapper.select(`.${trackName} .path-layer`) as d3.Selection

      this.drawRawTrackPoints(tracks, pointsLayer, range)
      this.drawTrackPaths(tracks, pathLayer, 0.3, 0.8)
    }
  }

  updateSemanticTracks(semanticTracks: Track[], range: Range) {
    const board = this.svg.select('.board')
    const pointsLayer = board.select('.semantic-tracks-wrapper .points-layer') as d3.Selection
    const pathLayer = board.select('.semantic-tracks-wrapper .path-layer') as d3.Selection

    this.drawSemanticTrackPoints(semanticTracks, pointsLayer, range)
    this.drawTrackPaths(semanticTracks, pathLayer, 0.4, 1, '1 1')
  }

  updateExtraTrackPoints(trackPoints: TrackPoint[]) {
    const a = pointRadius('raw') / Math.sqrt(2) - 0.1

    const layer = this.svg.select('.board .extra-points-layer')
    const pointsJoin = layer.selectAll('g')
      .data(trackPoints, (p: TrackPoint) => String(p.trackPointId))
    const pointsEnter = pointsJoin.enter()
      .append('g')
      .attr('transform', ({ x, y }) => `translate(${x}, ${y})`)
    pointsEnter.append('circle')
      .attr('fill', p => getColor(p.trackName))
      .attr('r', 0)
      .transition()
      .delay((_, i) => 50 * i)
      .attr('r', trackPointRadius)
    pointsEnter.append('line')
      .attr('x1', -a)
      .attr('y1', -a)
      .attr('x2', +a)
      .attr('y2', +a)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.2)
      .attr('stroke-linecap', 'round')
    pointsEnter.append('line')
      .attr('x1', -a)
      .attr('y1', +a)
      .attr('x2', +a)
      .attr('y2', -a)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.2)
      .attr('stroke-linecap', 'round')

    pointsJoin.exit().remove()
  }
}
