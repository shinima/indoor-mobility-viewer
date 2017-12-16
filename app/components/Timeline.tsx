import * as d3 from 'd3'
import * as moment from 'moment'
import * as React from 'react'
import { clamp } from 'lodash'

export interface TimelineProps {
  time: number
  onChangeTime: (time: number) => void
  tracks: Track[]
}

export interface TimelineState {
  time: number
}

export const CONFIG = {
  dx: 20,
  dy: 20,
}

export default class Timeline extends React.Component<TimelineProps, TimelineState> {
  svg: SVGSVGElement

  refSvg = (node: SVGSVGElement) => {
    this.svg = node
  }

  getYScale() {
    const { tracks } = this.props
    const startTime = tracks[0].startTime
    const endTime = tracks[tracks.length - 1].endTime
    return d3.scaleLinear()
      .domain([startTime, endTime])
      .range([0, 500])
  }

  updateTime = () => {
    const y = this.getYScale()
    this.props.onChangeTime(y.invert(d3.event.y - CONFIG.dy))
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
  }

  render() {
    const { tracks, time } = this.props
    const startTime = tracks[0].startTime
    const endTime = tracks[tracks.length - 1].endTime

    const clampedTime = clamp(time, startTime, endTime)

    // console.log(tracks.map(tr => tr.endTime - tr.startTime))
    const y = this.getYScale()

    return (
      <svg
        ref={this.refSvg}
        style={{ width: 360, height: 550, flex: '0 0 auto' }}
      >
        <g transform="translate(20,20)" fill="#1f77b4">
          {tracks.map(t =>
            <rect
              key={t.trackId}
              transform={`translate(0, ${y(t.startTime)})`}
              width="20"
              height={y(t.endTime) - y(t.startTime)}
            />
          )}

          {time !== 0 ? (
            <line
              x1="0"
              x2="200"
              y1={y(clampedTime)}
              y2={y(clampedTime)}
              stroke="black"
              strokeDasharray="6 6"
              strokeWidth="2"
            />
          ) : null}
          {time !== 0 ? (
            <text x="170" y={y(clampedTime) - 4} fill="black">
              {moment(clampedTime).format('HH:mm:ss')}
            </text>
          ) : null}
        </g>
      </svg>
    )
  }
}
