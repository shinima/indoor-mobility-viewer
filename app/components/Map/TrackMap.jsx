import React, { Component } from 'react'
import DrawingManager from './DrawingManager'
import '../../styles/Map.styl'

export default class TrackMap extends Component {
  // prop floor: 要绘制的楼层地图
  // prop trackMatrix: 需要显示的track矩阵(二维数组)
  // prop showPath: 是否要显示path
  // prop showPoints: 是否要显示points
  // prop htid: 高亮的track id, null表示没有光亮track

  componentDidMount() {
    const { floor, trackMatrix, showPath, showPoints, htid, htpid } = this.props
    this.drawingManager = new DrawingManager(this.svg, this.tooltipWrapper)
    this.drawingManager.updateFloor(floor)
    this.drawingManager.updateTrackMatrix(trackMatrix, {
      showPath,
      showPoints,
      htid,
      htpid,
    })
  }

  componentWillReceiveProps(nextProps) {
    const { floor, trackMatrix, showPath, showPoints, htid, htpid } = this.props
    // 用floorId来判断是否为同一个楼层
    if (floor.floorId !== nextProps.floor.floorId) {
      console.log('update-floor')
      this.drawingManager.updateFloor(nextProps.floor)
    }
    // todo 这里暂时使用 !== 来直接判断相等
    if (trackMatrix !== nextProps.trackMatrix
      || showPath !== nextProps.showPath
      || showPoints !== nextProps.showPoints
      || htid !== nextProps.htid
      || htpid !== nextProps.htpid) {
      console.log('update-track-matrix')
      this.drawingManager.updateTrackMatrix(nextProps.trackMatrix, {
        showPath: nextProps.showPath,
        showPoints: nextProps.showPoints,
        htid: nextProps.htid,
        htpid: nextProps.htpid,
      })
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
