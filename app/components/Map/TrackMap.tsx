import * as React from 'react'
import { Component } from 'react'
import * as d3 from 'd3'
import TrackDrawingManager from './TrackDrawingManager'
import FloorDrawingManager from './FloorDrawingManager'
import { getTimeRange, isSamePlainTrackMap, isSameTracks } from './utils'
import { MAX_SCALE, MIN_SCALE } from '../../utils/constants'
import { Track, Range, TrackPoint } from '../../interfaces'
import { getTrackPoints } from '../../utils/utils'
import '../../styles/Map.styl'
import TooltipManager from './TooltipManager'
import { PlainTrackMap } from '../../reducer'

export interface TrackMapProp {
  floor: Floor
  sid: number
  range: Range
  plainTrackMap: PlainTrackMap
  extraTrackPoints: TrackPoint[]
  semanticTracks: Track[]
  onChangeSid: (sid: number) => void
  // transform是否重置(大概等于当前楼层是否居中显示)
  transformReset: boolean
  onZoom: () => void
}

export default class TrackMap extends Component<TrackMapProp> {
  trackDrawingManager: TrackDrawingManager
  floorDrawingManager: FloorDrawingManager
  tooltipManager: TooltipManager
  svgElement: SVGSVGElement
  tooltipWrapper: HTMLDivElement

  componentDidMount() {
    const { floor, sid, plainTrackMap, semanticTracks, range } = this.props

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

    const semanticTrackPoints = getTrackPoints(semanticTracks)
    const selectedSemanticTrackPoint = semanticTrackPoints.find(p => p.trackPointId === sid)
    const highlightedRegionId = selectedSemanticTrackPoint ? selectedSemanticTrackPoint.roomID : -1

    this.floorDrawingManager = new FloorDrawingManager(this.svgElement, zoom, board)
    this.floorDrawingManager.updateFloor(floor, highlightedRegionId)
    this.tooltipManager = new TooltipManager(d3.select(this.tooltipWrapper), zoom, this.svgElement)

    this.trackDrawingManager = new TrackDrawingManager(this.svgElement, zoom, getProps)
    this.trackDrawingManager.updatePlainTrackMap(plainTrackMap, range)
    this.trackDrawingManager.updateSemanticTracks(semanticTracks, range)

  }

  componentWillReceiveProps(nextProps: TrackMapProp) {
    const { floor, sid, plainTrackMap, semanticTracks, transformReset } = this.props

    // TODO 绘制extraTrackPoints
    console.log(nextProps.extraTrackPoints)

    const semanticTrackPoints = getTrackPoints(nextProps.semanticTracks)
    const selectedSemanticTrackPoint = semanticTrackPoints.find(p => p.trackPointId === nextProps.sid)
    const highlightedRegionId = selectedSemanticTrackPoint ? selectedSemanticTrackPoint.roomID : -1

    this.tooltipManager.setTarget(selectedSemanticTrackPoint)
    this.tooltipManager.update()

    // 用floorId来判断是否为同一个楼层
    if (floor.floorId !== nextProps.floor.floorId || sid !== nextProps.sid) {
      // console.log('update-floor')
      this.floorDrawingManager.updateFloor(nextProps.floor, highlightedRegionId)
    }

    if (!isSamePlainTrackMap(plainTrackMap, nextProps.plainTrackMap) || sid !== nextProps.sid) {
      // console.log('update-rawTracks')
      this.trackDrawingManager.updatePlainTrackMap(nextProps.plainTrackMap, nextProps.range)
    }

    if (!isSameTracks(semanticTracks, nextProps.semanticTracks) || sid !== nextProps.sid) {
      this.trackDrawingManager.updateSemanticTracks(nextProps.semanticTracks, nextProps.range)
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
            <g className="doors-layer-wrapper" />
            <g className="texts-layer-wrapper" />
            <g className="plain-track-map-wrapper">
              <g className="ground-truth">
                <g className="path-layer" />
                <g className="points-layer" />
              </g>
              <g className="raw">
                <g className="path-layer" />
                <g className="points-layer" />
              </g>
              <g className="cleaned-raw">
                <g className="path-layer" />
                <g className="points-layer" />
              </g>
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
