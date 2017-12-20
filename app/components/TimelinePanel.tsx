import * as d3 from 'd3'
import * as Mousetrap from 'mousetrap'
import * as moment from 'moment'
import * as React from 'react'
import { Track, TrackPoint } from '../interfaces'
import { getTrackPoints } from '../utils/utils'
import '../styles/TimelinePanel.styl'

export interface Props {
  sid: number
  onChangeSid: (sid: number) => void
  rawTracks: Track[]
  semanticTracks: Track[]
}

export interface State {
  time: number
}

function TrackPointText({ point: p }: { point: TrackPoint }) {
  const start = p.time
  const end = p.time + p.duration
  return (
    <p>{p.floorId}F Room No.{p.roomID} {p.event} {moment(start).format('mm:ss')} -- {moment(end).format('mm:ss')}</p>
  )
}

export default class TimelinePanel extends React.Component<Props, State> {
  componentWillReceiveProps({ sid }: Props) {
    const itemNode = document.querySelector(`.item[data-trackpointid='${sid}']`) as any
    if (itemNode) {
      itemNode.scrollIntoViewIfNeeded()
    }
  }

  selectPrevTrackPoint = () => {
    const { semanticTracks, sid, onChangeSid } = this.props
    const points = getTrackPoints(semanticTracks)
    const currentIndex = points.findIndex(p => p.trackPointId === sid)
    const prevPoint = points[currentIndex - 1]
    if (prevPoint) {
      onChangeSid(prevPoint.trackPointId)
    }
  }

  selectNextTrackPoint = () => {
    const { semanticTracks, sid, onChangeSid } = this.props
    const points = getTrackPoints(semanticTracks)
    const currentIndex = points.findIndex(p => p.trackPointId === sid)
    const nextPoint = points[currentIndex + 1]
    if (nextPoint) {
      onChangeSid(nextPoint.trackPointId)
    }
  }

  componentDidMount() {
    Mousetrap.bind('w', this.selectPrevTrackPoint)
    Mousetrap.bind('up', this.selectPrevTrackPoint)
    Mousetrap.bind('s', this.selectNextTrackPoint)
    Mousetrap.bind('down', this.selectNextTrackPoint)
  }

  componentWillUnmount() {
    Mousetrap.unbind('w')
    Mousetrap.unbind('s')
    Mousetrap.unbind('up')
    Mousetrap.unbind('down')
  }

  render() {
    const { semanticTracks, sid, onChangeSid } = this.props
    const points = getTrackPoints(semanticTracks)
    const h = d3.scaleLinear().domain([0, 1]).range([20, 20])

    const gap = 10

    return (
      <div className="timeline-panel">
        <h1 className="title">Semantic Timeline</h1>
        <div className="content">
          <div className="list">
            {points.map((p) =>
              <div
                key={p.trackPointId}
                className="item"
                data-trackpointid={p.trackPointId}
                style={{
                  marginTop: gap,
                  height: h(p.duration),
                }}
              >
                {p.trackPointId === sid ? (
                  <svg
                    width="20"
                    height="20"
                    style={{ display: 'block', position: 'absolute' }}
                  >
                    <rect x="0" y="0" width="20" height="20" fill="#2196f3" />
                  </svg>
                ) : null}
                <div
                  onClick={() => onChangeSid(p.trackPointId)}
                  style={{ cursor: 'pointer', marginLeft: 20, backgroundColor: '#e02b2b', width: 30 }}
                />
                <TrackPointText point={p} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
