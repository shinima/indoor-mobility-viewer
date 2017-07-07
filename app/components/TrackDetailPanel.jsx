import React, { Component } from 'react'
import moment from 'moment'
import classNames from 'classnames'
import { getColor } from '../utils/utils'
import '../styles/TrackDetailPanel.styl'
import Button from '../components/Button'
import { floorConfig } from '../resources/floors'

function getFloorNameByFloorId(floorId) {
  return floorConfig.find(flr => flr.floorId === floorId).floorName
}

function TrackPointSymbol({ pointType, fill }) {
  if (pointType === 'track-start') {
    return (
      <svg className="symbol" viewBox="0 0 1 1">
        <rect x="0" y="0" width="1" height="1" fill={fill} />
      </svg>
    )
  } else if (pointType === 'normal') {
    return (
      <svg className="symbol circle" viewBox="0 0 2 2">
        <circle cx="1" cy="1" r="1" fill={fill} />
      </svg>
    )
  } else if (pointType === 'track-end') {
    return (
      <svg className="symbol" viewBox="0 0 2 2">
        <polygon points="1,0 2,2 0,2" fill={fill} />
      </svg>
    )
  } else {
    throw new Error(`Invalid pointType: ${pointType}`)
  }
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
      onChangeHtid, onChangeHtpid, onCentralizeTrack, previousDisabled, nextDisabled,
    } = this.props
    const tracksIdArray = tracks.map(track => track.trackId)
    const index = tracksIdArray.indexOf(ht.trackId)
    const previous = previousDisabled ? 'previous-disabled' : 'previous'
    const next = nextDisabled ? 'next-disabled' : 'next'
    return (
      <div className="track-detail-panel">
        <h1 className="title">
          <img
            className="close"
            onClick={() => onChangeHtid(null)}
            style={{ width: 20, height: 20 }}
            src="/static/img/close.svg"
            alt="close"
          />
          {humanize(ht.mac)} 轨迹详情
        </h1>
        <div className="prev-or-next">
          <Button
            icon={`/static/img/buttonGroup/${previous}.svg`}
            text={previousDisabled ? '暂无轨迹' : '上一条轨迹'}
            altText="previous"
            clickEvent={!previousDisabled ? () => onChangeHtid(tracksIdArray[index - 1]) : null}
          />
          <Button
            icon={`/static/img/buttonGroup/${next}.svg`}
            text={nextDisabled ? '暂无轨迹' : '下一条轨迹'}
            altText="next"
            clickEvent={!nextDisabled ? () => onChangeHtid(tracksIdArray[index + 1]) : null}
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

