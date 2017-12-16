import * as React from 'react'
import { Component } from 'react'
import * as moment from 'moment'
import * as classNames from 'classnames'
import { getColor } from '../utils/utils'
import '../styles/TrackDetailPanel.styl'
import { floorConfig } from '../resources/floors'
import TrackPointSymbol from '../components/TrackPointSymbol'
import Timeline from './Timeline'

function getFloorNameByFloorId(floorId: number) {
  return floorConfig.find(flr => flr.floorId === floorId).floorName
}

type TrackPointRowProp = {
  trackPoint: TrackPoint,
  onChangeHtpid: (trackPointId: number) => void
  highlighted: boolean,
}

function TrackPointRow({
                         trackPoint: { trackPointId, mac, time, duration, pointType },
                         onChangeHtpid,
                         highlighted,
                       }: TrackPointRowProp) {
  // 超过180秒(3分钟)就认为是停留
  const isStay = duration > 180e3

  return (
    <li
      className={classNames('track-point', { highlighted })}
      onMouseEnter={() => onChangeHtpid(trackPointId)}
    >
      <TrackPointSymbol pointType={pointType} fill={getColor(mac)} />
      <div className="time">
        {moment(time).format('HH:mm:ss')}
        {isStay ? ` ~ ${moment(time + duration).format('HH:mm:ss')}` : null}
      </div>
    </li>
  )
}

type TrackInfo = {
  track: Track
  floorId: number
  htid: number
  onChangeHtid: (trackId: number) => void
  onCentralizeTrack: (trackId: number) => void
}

function TrackInfo({ track, floorId, htid, onChangeHtid, onCentralizeTrack }: TrackInfo) {
  let button
  if (track.floorId !== floorId || track.trackId !== htid) {
    const onClick = () => onChangeHtid(track.trackId)
    button = <button className="centralize-button" onClick={onClick}>切换</button>
  } else {
    const onClick = () => onCentralizeTrack(track.trackId)
    button = <button className="centralize-button" onClick={onClick}>居中</button>
  }
  return (
    <div className="track-info">
      <p className="first-line">
        轨迹
        <span style={{ paddingLeft: 2, paddingRight: 8, fontWeight: 'bold' }}>
          {track.trackId}
        </span>
        <span style={{ fontWeight: 'bold', color: 'steelblue' }}>
          {getFloorNameByFloorId(track.floorId)}
        </span>
        {button}
      </p>
      <p>
        {moment(track.startTime).format('HH:mm')}
        <span style={{ paddingLeft: 2, paddingRight: 2 }}>~</span>
        {moment(track.endTime).format('HH:mm')}
      </p>
    </div>
  )
}

type TrackDetailProp = {
  track: Track
  floorId: number
  htid: number
  htpid: number
  onChangeHtpid: (trackPointId: number) => void
}

function TrackDetail({ track, floorId, htid, htpid, onChangeHtpid }: TrackDetailProp) {
  if (track.floorId === floorId && track.trackId === htid) {
    return (
      <ol className="track-point-list" onMouseLeave={() => onChangeHtpid(null)}>
        {track.points.map(trackPoint => (
          <TrackPointRow
            key={trackPoint.trackPointId}
            trackPoint={trackPoint}
            onChangeHtpid={onChangeHtpid}
            highlighted={trackPoint.trackPointId === htpid}
          />
        ))}
      </ol>
    )
  } else {
    return null
  }
}

interface TrackDetailPanelProp {
  time: number
  onChangeTime: (time: number) => void
  tracks: Track[]
  onCentralizeTrack: (trackId: number) => void
}

export default class TrackDetailPanel extends Component<TrackDetailPanelProp> {
  render() {
    const { time, onChangeTime,tracks, onCentralizeTrack } = this.props

    return (
      <div className="track-detail-panel">
        <h1 className="title">Timeline</h1>
        <Timeline
          tracks={tracks}
          time={time}
          onChangeTime={onChangeTime}
        />

        {/*<div className="track-list">*/}
        {/*{tracks.map(track => (*/}
        {/*<div*/}
        {/*key={track.trackId}*/}
        {/*className={classNames('track', { highlighted: track.trackId === htid })}*/}
        {/*>*/}
        {/*<TrackInfo*/}
        {/*track={track}*/}
        {/*floorId={floorId}*/}
        {/*htid={htid}*/}
        {/*onChangeHtid={onChangeHtid}*/}
        {/*onCentralizeTrack={onCentralizeTrack}*/}
        {/*/>*/}
        {/*<TrackDetail*/}
        {/*track={track}*/}
        {/*floorId={floorId}*/}
        {/*htid={htid}*/}
        {/*htpid={htpid}*/}
        {/*onChangeHtpid={onChangeHtpid}*/}
        {/*/>*/}
        {/*</div>*/}
        {/*))}*/}
        {/*</div>*/}
      </div>
    )
  }
}

