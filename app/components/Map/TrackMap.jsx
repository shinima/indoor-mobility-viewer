import React, { Component } from 'react'
import DrawingManager from './DrawingManager'
import { isSameTracks } from './utils'
import '../../styles/Map.styl'

export default class TrackMap extends Component {
  // prop floor: 要绘制的楼层地图
  // prop tracks: 需要显示的track数组
  // prop showPath: 是否要显示path
  // prop showPoints: 是否要显示points
  // prop htid: 高亮的track id, null表示没有光亮track
  // prop ctid: 居中显示的track id. 初次渲染的时候忽略该prop, 该prop仅在发生变化的时候有效
  //   并且需要保证ctid对应的path元素目前是渲染在地图上面的
  // prop transformReset: transform是否重置(大概等于当前楼层是否居中显示)

  componentDidMount() {
    const {
      floor, tracks, showPath, showPoints, htid, htpid,
      // onZoom, humanize, onChangeHtid, onChangeHtpid,
    } = this.props
    const getProps = () => this.props
    this.drawingManager = new DrawingManager(this.svg, this.tooltipWrapper, getProps)
    this.drawingManager.updateFloor(floor)
    this.drawingManager.updateTracks(tracks, {
      showPath,
      showPoints,
      htid,
      htpid,
    })
  }

  componentWillReceiveProps(nextProps) {
    const { floor, tracks, showPath, showPoints, htid, ctid, htpid, transformReset } = this.props
    // 用floorId来判断是否为同一个楼层
    if (floor.floorId !== nextProps.floor.floorId) {
      // console.log('update-floor')
      this.drawingManager.updateFloor(nextProps.floor)
    }
    if (!isSameTracks(tracks, nextProps.tracks)
      || showPath !== nextProps.showPath
      || showPoints !== nextProps.showPoints
      || htid !== nextProps.htid
      || htpid !== nextProps.htpid) {
      // console.log('update-tracks')
      this.drawingManager.updateTracks(nextProps.tracks, {
        showPath: nextProps.showPath,
        showPoints: nextProps.showPoints,
        htid: nextProps.htid,
        htpid: nextProps.htpid,
      })
    }
    if (ctid !== nextProps.ctid && nextProps.ctid != null) {
      const track = nextProps.tracks.find(t => t.trackId === nextProps.ctid)
      this.drawingManager.centralizeTrack(track)
    }
    if (!transformReset && nextProps.transformReset) {
      this.drawingManager.resetTransform()
    }
  }

  shouldComponentUpdate() {
    return false
  }

  // componentWillUnmount() {
  //   this.drawingManager.destroy()
  // }

  drawingManager = null
  svg = null
  tooltipWrapper = null

  render() {
    return (
      <div className="track-map">
        <div
          className="tooltip-wrapper"
          ref={node => (this.tooltipWrapper = node)}
        />
        <svg
          className="track-map-svg"
          style={{ width: '100%', height: '100%' }}
          ref={node => (this.svg = node)}
        >
          {/* 下面的markup在did-mount函数被调用的时候就会存在于真实DOM中 */}
          <g className="board">
            <g className="regions-layer-wrapper" />
            <g className="texts-layer-wrapper" />
            <g className="track-path-layer" />
            <g className="track-points-layer" />
          </g>
        </svg>
      </div>
    )
  }
}
