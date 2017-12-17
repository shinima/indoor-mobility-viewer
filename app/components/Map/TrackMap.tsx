import * as React from 'react'
import { Component } from 'react'
import * as d3 from 'd3'
import TrackDrawingManager from './TrackDrawingManager'
import FloorDrawingManager from './FloorDrawingManager'
import { isSameTracks } from './utils'
import '../../styles/Map.styl'
import { MAX_SCALE, MIN_SCALE } from '../../utils/constants'
import { Track } from '../../interfaces'

export interface TrackMapProp {
  time: number
  // 要绘制的楼层地图
  floor: Floor
  rawTracks: Track[]
  semanticTracks: Track[]
  // 居中显示的track id. 初次渲染的时候忽略该prop, 该prop仅在发生变化的时候有效
  // 并且需要保证ctid对应的path元素目前是渲染在地图上面的
  ctid: number
  // transform是否重置(大概等于当前楼层是否居中显示)
  transformReset: boolean

  onChangeTime: (time: number) => void
  onZoom: () => void
}

export default class TrackMap extends Component<TrackMapProp> {
  trackDrawingManager: TrackDrawingManager
  floorDrawingManager: FloorDrawingManager
  svgElement: SVGSVGElement
  tooltipWrapper: HTMLDivElement

  componentDidMount() {
    const { floor, rawTracks, semanticTracks, time } = this.props

    const getProps = () => this.props
    const zoom = d3.zoom() as d3.ZoomBehavior<SVGSVGElement, null>
    const svg = d3.select(this.svgElement)
    const board = svg.select('.board') as d3.Selection<SVGGElement>

    zoom.scaleExtent([MIN_SCALE, MAX_SCALE])
      .on('zoom.board', () => {
        const { transform } = d3.event
        board.attr('transform', transform)
        getProps().onZoom()
      })
    svg.call(zoom)

    this.floorDrawingManager = new FloorDrawingManager(this.svgElement, zoom, board)
    this.floorDrawingManager.updateFloor(floor)

    this.trackDrawingManager = new TrackDrawingManager(this.svgElement, this.tooltipWrapper, zoom, getProps)
    this.trackDrawingManager.updateRawTracks(rawTracks, { time })
    this.trackDrawingManager.updateSemanticTracks(semanticTracks, { time })
  }

  componentWillReceiveProps(nextProps: TrackMapProp) {
    const { floor, time, rawTracks, semanticTracks, ctid, transformReset } = this.props
    // 用floorId来判断是否为同一个楼层
    if (floor.floorId !== nextProps.floor.floorId) {
      // console.log('update-floor')
      this.floorDrawingManager.updateFloor(nextProps.floor)
    }

    if (!isSameTracks(rawTracks, nextProps.rawTracks) || time !== nextProps.time) {
      // console.log('update-rawTracks')
      this.trackDrawingManager.updateRawTracks(nextProps.rawTracks, {
        time: nextProps.time,
      })
    }

    if (!isSameTracks(semanticTracks, nextProps.semanticTracks) || time !== nextProps.time) {
      this.trackDrawingManager.updateSemanticTracks(nextProps.semanticTracks, nextProps)
    }

    if (ctid !== nextProps.ctid && nextProps.ctid != null) {
      const track = nextProps.rawTracks.find(t => t.trackId === nextProps.ctid)
      if (track) {
        this.trackDrawingManager.centralizeRawTrack(track)
      }
    }
    if (!transformReset && nextProps.transformReset) {
      this.floorDrawingManager.resetTransform()
    }
  }

  shouldComponentUpdate() {
    return false
  }

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
          ref={node => (this.svgElement = node)}
        >
          {/* 下面的markup在did-mount函数被调用的时候就会存在于真实DOM中 */}
          <g className="board">
            <g className="regions-layer-wrapper" />
            <g className="texts-layer-wrapper" />
            <g className="raw-tracks-wrapper">
              <g className="path-layer" />
              <g className="points-layer" />
            </g>
            <g className="semantic-tracks-wrapper">
              <g className="path-layer" />
              <g className="points-layer" />
            </g>
          </g>
        </svg>
      </div>
    )
  }
}
