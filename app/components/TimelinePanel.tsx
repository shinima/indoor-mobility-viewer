import * as d3 from 'd3'
import * as Mousetrap from 'mousetrap'
import * as moment from 'moment'
import * as React from 'react'
import { clamp } from 'lodash'
import { Track, TrackName, TrackPoint } from '../interfaces'
import '../styles/TimelinePanel.styl'
import { getClosestTrackPointId, getColor } from '../utils/utils'

export interface Props {
  time: number
  onChangeTime: (time: number) => void
  rawTracks: Track[]
  semanticTracks: Track[]
  baseTrackName: TrackName
}

export interface State {
  time: number
}

const CONFIG = {
  dx: 20,
  dy: 24,
}

export default class TimelinePanel extends React.Component<Props, State> {
  svg: SVGSVGElement

  refSvg = (node: SVGSVGElement) => {
    this.svg = node
  }

  getTimeRange() {
    const { rawTracks: rts, semanticTracks: sts } = this.props
    const start = Math.min(rts[0].startTime, sts[0].startTime)
    const end = Math.max(rts[rts.length - 1].endTime, sts[sts.length - 1].endTime)
    return { start, end }
  }

  getYScale() {
    const { start, end } = this.getTimeRange()
    return d3.scaleLinear()
      .domain([start, end])
      .range([0, 500])
  }

  updateTime = () => {
    const y = this.getYScale()
    this.props.onChangeTime(y.invert(d3.event.y - CONFIG.dy))
  }

  getBaseTracks() {
    const { baseTrackName, rawTracks, semanticTracks } = this.props
    return baseTrackName === 'raw' ? rawTracks : semanticTracks
  }

  selectPrevTrackPoint = () => {
    const { time, onChangeTime } = this.props
    const baseTracks = this.getBaseTracks()
    const points = baseTracks.reduce<TrackPoint[]>((ps, track) => ps.concat(track.points), [])
    const prevPoint = points.reverse().find(p => p.time < time)
    if (prevPoint) {
      onChangeTime(prevPoint.time)
    }
  }

  selectNextTrackPoint = () => {
    const { time, onChangeTime } = this.props
    const baseTracks = this.getBaseTracks()
    const points = baseTracks.reduce<TrackPoint[]>((ps, track) => ps.concat(track.points), [])
    const nextPoint = points.find(p => p.time > time)
    if (nextPoint) {
      onChangeTime(nextPoint.time)
    }
  }

  componentDidMount() {
    const drag = d3.drag()
      .container(function <T>(this: T): T {
        return this
      })
      .on('start', this.updateTime)
      .on('drag', this.updateTime)
      .on('end', this.updateTime)

    d3.select(this.svg).call(drag)

    Mousetrap.bind('w', this.selectPrevTrackPoint)
    Mousetrap.bind('s', this.selectNextTrackPoint)
  }

  componentWillUnmount() {
    Mousetrap.unbind('w')
    Mousetrap.unbind('s')
  }

  renderHorizontalLine() {
    const { time } = this.props
    if (time === 0) {
      return null
    }
    const { start, end } = this.getTimeRange()
    const yScale = this.getYScale()
    const clampedTime = clamp(time, start, end)

    return (
      <g role="horizontal-line" transform={`translate(${CONFIG.dx}, ${CONFIG.dy})`}>
        <line
          x1="0"
          x2="200"
          y1={yScale(clampedTime)}
          y2={yScale(clampedTime)}
          stroke="black"
          strokeDasharray="6 6"
          strokeWidth="2"
        />
        <text x="170" y={yScale(clampedTime) - 4} fill="black">
          {moment(clampedTime).format('HH:mm:ss')}
        </text>
      </g>
    )
  }

  renderRawRects() {
    const { rawTracks, time } = this.props
    const points = rawTracks.reduce<TrackPoint[]>((ps, track) => ps.concat(track.points), [])
    const yScale = this.getYScale()
    const fill = getColor('raw')
    const brighterFill = d3.color(fill).brighter(0.8).toString()
    const closestTrackPointId = getClosestTrackPointId(points, time)

    return (
      <g transform={`translate(${CONFIG.dx}, ${CONFIG.dy})`} fill={fill}>
        <g opacity="0.2">
          {rawTracks.map(t =>
            <rect
              key={t.trackId}
              transform={`translate(0, ${yScale(t.startTime)})`}
              width="20"
              height={yScale(t.endTime) - yScale(t.startTime)}
            />
          )}
        </g>
        {/*<g>*/}
        {/*{points.map(p =>*/}
        {/*<rect*/}
        {/*key={p.trackPointId}*/}
        {/*transform={`translate(0, ${yScale(p.time)})`}*/}
        {/*x="0"*/}
        {/*y="0"*/}
        {/*width="20"*/}
        {/*height={Math.max(1, yScale(p.duration) - yScale(0))}*/}
        {/*fill={p.trackPointId === closestTrackPointId ? brighterFill : fill}*/}
        {/*/>*/}
        {/*)}*/}
        {/*</g>*/}
      </g>
    )
  }

  renderSemanticRects() {
    const { semanticTracks, time } = this.props
    const points = semanticTracks.reduce<TrackPoint[]>((ps, track) => ps.concat(track.points), [])

    const yScale = this.getYScale()

    const fill = getColor('semantic')
    const brighterFill = d3.color(fill).brighter(0.8).toString()
    const closestTrackPointId = getClosestTrackPointId(points, time)

    return (
      <g transform={`translate(${CONFIG.dx + 40}, ${CONFIG.dy})`} fill={fill}>
        {points.map(p =>
          <rect
            key={p.trackPointId}
            transform={`translate(0, ${yScale(p.time)})`}
            x="0"
            y="0"
            width="20"
            height={Math.max(1, yScale(p.duration) - yScale(0))}
            fill={p.trackPointId === closestTrackPointId ? brighterFill : fill}
          />
        )}
      </g>
    )
  }

  render() {
    return (
      <div className="timeline-panel">
        <h1 className="title">Timeline</h1>
        <svg
          ref={this.refSvg}
          style={{ width: 360, height: 550, flex: '0 0 auto' }}
        >
          {this.renderRawRects()}
          {this.renderSemanticRects()}
          {this.renderHorizontalLine()}
        </svg>
      </div>
    )
  }
}
