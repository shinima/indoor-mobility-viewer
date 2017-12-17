import * as d3 from 'd3'
import * as moment from 'moment'
import * as React from 'react'
import { clamp } from 'lodash'
import { Track } from '../interfaces'
import '../styles/TimelinePanel.styl'
import { getColor } from '../utils/utils'

export interface Props {
  time: number
  onChangeTime: (time: number) => void
  rawTracks: Track[]
  semanticTracks: Track[]
}

export interface State {
  time: number
}

export const CONFIG = {
  dx: 20,
  dy: 24,
}

export default class TimelinePanel extends React.Component<Props, State> {
  svg: SVGSVGElement

  refSvg = (node: SVGSVGElement) => {
    this.svg = node
  }

  getYScale() {
    const { rawTracks } = this.props
    const startTime = rawTracks[0].startTime
    const endTime = rawTracks[rawTracks.length - 1].endTime
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
    const { rawTracks, semanticTracks, time } = this.props
    const startTime = rawTracks[0].startTime
    const endTime = rawTracks[rawTracks.length - 1].endTime

    const clampedTime = clamp(time, startTime, endTime)

    // console.log(tracks.map(tr => tr.endTime - tr.startTime))
    const y = this.getYScale()

    return (
      <div className="timeline-panel">
        <h1 className="title">Timeline</h1>
        <svg
          ref={this.refSvg}
          style={{ width: 360, height: 550, flex: '0 0 auto' }}
        >
          <g transform={`translate(20,${CONFIG.dy})`} fill={getColor('raw')}>
            {rawTracks.map(t =>
              <rect
                key={t.trackId}
                transform={`translate(0, ${y(t.startTime)})`}
                width="20"
                height={y(t.endTime) - y(t.startTime)}
              />
            )}
          </g>

          <g transform={`translate(60,${CONFIG.dy})`} fill={getColor('semantic')}>
            {semanticTracks.map(t =>
              <rect
                key={t.trackId}
                transform={`translate(0, ${y(t.startTime)})`}
                x="0"
                y="0"
                width="20"
                height={y(t.endTime) - y(t.startTime)}
              />
            )}
          </g>
          {time !== 0 ? (
            <g>
              <line
                x1="20"
                x2="220"
                y1={y(clampedTime) + CONFIG.dy}
                y2={y(clampedTime) + CONFIG.dy}
                stroke="black"
                strokeDasharray="6 6"
                strokeWidth="2"
              />
              <text x="190" y={y(clampedTime) - 4 + CONFIG.dy} fill="black">
                {moment(clampedTime).format('HH:mm:ss')}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    )
  }
}
