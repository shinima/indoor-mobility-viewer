import React, { Component } from 'react'
import moment from 'moment'
import classNames from 'classnames'
import { getColor } from '../utils/utils'
import '../styles/TrackDetailPanel.styl'
import Button from '../components/Button'
import { floorConfig } from '../resources/floors'
import TrackPointSymbol from '../components/TrackPointSymbol'

function getFloorNameByFloorId(floorId) {
  return floorConfig.find(flr => flr.floorId === floorId).floorName
}

function TrackPointRow({
                         trackPoint: { trackPointId, mac, time, duration, pointType },
                         onChangeHtpid,
                         highlighted,
                       }) {
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

// eslint-disable-next-line max-len
function TrackInfo({ track, index, floorId, htid, onChangeHtid, onCentralizeTrack }) {
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
        <span style={{ paddingRight: 8, fontWeight: 'bold' }}>
          {index + 1}
        </span>
        <span style={{ fontWeight: 'bold', color: 'steelblue' }}>
          {getFloorNameByFloorId(track.floorId)}
        </span>
        {button}
      </p>
      <p>
        {moment(track.startTime).format('HH:mm')}
        ~
        {moment(track.endTime).format('HH:mm')}
      </p>
    </div>
  )
}

function TrackDetail({ track, floorId, htid, htpid, onChangeHtpid }) {
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

export default class TrackDetailPanel extends Component {
  render() {
    const {
      tracks, floorId, ht, htid, htpid, humanize,
      onChangeHtid, onChangeHtpid, onCentralizeTrack,
    } = this.props
    const tracksIdArray = tracks.map(track => track.trackId)
    const index = tracksIdArray.indexOf(ht.trackId)
    const previousDisabled = index === 0
    const nextDisabled = index === tracksIdArray.length - 1
    const previous = previousDisabled ? 'previous-disabled' : 'previous'
    const next = nextDisabled ? 'next-disabled' : 'next'
    return (
      <div className="track-detail-panel">
        <h1 className="title">
          <img
            className="close"
            onClick={() => onChangeHtid(null)}
            style={{ width: 20, height: '100%' }}
            src="/static/img/close.svg"
            alt="close"
          />
          {humanize(ht.mac)} 轨迹详情
        </h1>
        <div className="prev-or-next">
          <Button
            icon={`/static/img/buttonGroup/${previous}.svg`}
            text="上一条轨迹"
            altText="previous"
            style={{
              color: previousDisabled ? '#888888' : 'black',
              cursor: previousDisabled ? 'default' : 'pointer',
            }}
            onClick={!previousDisabled ? () => onChangeHtid(tracksIdArray[index - 1]) : null}
          />
          <Button
            icon={`/static/img/buttonGroup/${next}.svg`}
            text="下一条轨迹"
            altText="next"
            style={{
              color: nextDisabled ? '#888888' : 'black',
              cursor: nextDisabled ? 'default' : 'pointer',
            }}
            onClick={!nextDisabled ? () => onChangeHtid(tracksIdArray[index + 1]) : null}
          />
        </div>
        <div className="track-list">
          {tracks.map((track, index) => (
            <div
              key={track.trackId}
              className={classNames('track', { highlighted: track.trackId === htid })}
            >
              <TrackInfo
                track={track}
                index={index}
                floorId={floorId}
                htid={htid}
                onChangeHtid={onChangeHtid}
                onCentralizeTrack={onCentralizeTrack}
              />
              <TrackDetail
                track={track}
                floorId={floorId}
                htid={htid}
                htpid={htpid}
                onChangeHtpid={onChangeHtpid}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

