import React, { Component } from 'react'
import moment from 'moment'
import classNames from 'classnames'
import { getColor } from '../utils/utils'
import '../styles/TrackDetailPanel.styl'

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

export default class TrackDetailPanel extends Component {
  render() {
    const {
      macs, hmac, tracks, floorId,
      htpid,
      onChangeHtid, onChangeHmac, onChangeHtpid,
    } = this.props
    // console.log(tracks)
    return (
      <div className="track-detail-panel">
        <h1 className="title">轨迹详情</h1>
        <div>
          <span>mac: </span>
          <select value={hmac} onChange={e => onChangeHmac(e.target.value)}>
            {macs.map(mac => (
              <option key={mac} value={mac}>{mac}</option>
            )).toArray()}
          </select>
        </div>
        <div className="track-list">
          {tracks.map(track => (
            <div
              className="track"
              key={track.trackId}
              onMouseEnter={track.floorId === floorId ?
                () => onChangeHtid(track.trackId) : null}
              onMouseLeave={() => onChangeHtid(null)}
            >
              <div>
                <span>轨迹{track.trackId}</span>
                <span style={{ color: 'steelblue', paddingLeft: 16 }}>
                  {track.floorId}
                </span>
              </div>
              {track.floorId === floorId ? (
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
              ) : (
                <div>该轨迹不在当前楼层内, 点击切换楼层</div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

