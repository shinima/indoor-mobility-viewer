import * as React from 'react'
import { Component } from 'react'
import DrawingManager from './DrawingManager'
import { isSameTracks } from './utils'
import '../../styles/Map.styl'

export type TrackMapProp = {
  // 要绘制的楼层地图
  floor: Floor
  // 需要显示的track数组
  tracks: Track[]
  // 需要绘制的定位点的数组
  items: LocationItem[]
  // 是否要显示path
  showPath: boolean
  // 是否要显示points
  showPoints: boolean
  // 是否需要显示噪声点
  showNoise: boolean
  // 是否需要显示成员点
  showMembers: boolean
  // 高亮的track id, null表示没有高亮track
  htid: number
  htpid: number
  // 居中显示的track id. 初次渲染的时候忽略该prop, 该prop仅在发生变化的时候有效
  //   并且需要保证ctid对应的path元素目前是渲染在地图上面的
  ctid: number
  // transform是否重置(大概等于当前楼层是否居中显示)
  transformReset: boolean

  onChangeHtid: (trackId: number) => void
  onChangeHtpid: (trackPointId: number) => void
  onZoom: () => void
  humanize: (mac: string) => string
}

export default class TrackMap extends Component<TrackMapProp> {
  drawingManager: DrawingManager = null
  svg: SVGSVGElement = null
  tooltipWrapper: HTMLDivElement = null

  componentDidMount() {
    const {
      floor, tracks, items, showPath, showPoints, showNoise, showMembers, htid, htpid,
      // onZoom, humanize, onChangeHtid, onChangeHtpid,
    } = this.props
    const getProps = () => this.props
    this.drawingManager = new DrawingManager(this.svg, this.tooltipWrapper, getProps)
    this.drawingManager.updateFloor(floor)
    this.drawingManager.updateLocationItems(items, { showNoise })
    this.drawingManager.updateTracks(tracks, {
      showPath,
      showPoints,
      showMembers,
      htid,
      htpid,
    })
  }

  componentWillReceiveProps(nextProps: TrackMapProp) {
    const {
      floor, tracks, showPath, showPoints, showNoise, showMembers,
      htid, ctid, htpid, transformReset,
    } = this.props
    // 用floorId来判断是否为同一个楼层
    if (floor.floorId !== nextProps.floor.floorId) {
      // console.log('update-floor')
      this.drawingManager.updateFloor(nextProps.floor)
    }
    if (!isSameTracks(tracks, nextProps.tracks)
      || showPath !== nextProps.showPath
      || showPoints !== nextProps.showPoints
      || showNoise !== nextProps.showNoise
      || showMembers !== nextProps.showMembers
      || htid !== nextProps.htid
      || htpid !== nextProps.htpid) {
      // console.log('update-tracks')
      this.drawingManager.updateTracks(nextProps.tracks, {
        showPath: nextProps.showPath,
        showPoints: nextProps.showPoints,
        showMembers: nextProps.showMembers,
        htid: nextProps.htid,
        htpid: nextProps.htpid,
      })
      this.drawingManager.updateLocationItems(nextProps.items, { showNoise: nextProps.showNoise })
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
            <g style={{ pointerEvents: 'none', opacity: 0.2, fill: 'black' }} className="items-layer" />
          </g>
        </svg>
      </div>
    )
  }
}
