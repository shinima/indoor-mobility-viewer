import * as React from 'react'
import { Component } from 'react'
import * as d3 from 'd3'
import drawFloor from './drawFloor'
import centralize from './centralize'
import { isSameItems } from './utils'

const Heatmap = require('heatmap.js').default

// 热度图配置
const config = {
  // 点的半径
  radius: 40,
  // 热度图的max配置与时间长度的比例
  // 1ms内数据点为maxPerMs个时, 热度图达到最热
  maxPerMs: 1 / 200e3,
}

type Prop = {
  floor: Floor
  items: Location[]
  transformReset: boolean
  onZoom: () => void
  span: number
}

export default class HeatMap extends Component<Prop> {
  // static propTypes = {
  //   floor: PropTypes.object.isRequired,
  //   items: PropTypes.array.isRequired,
  //   transformReset: PropTypes.bool.isRequired,
  //   onZoom: PropTypes.func.isRequired,
  //   span: PropTypes.number.isRequired,
  // }
  canvasWrapper: HTMLDivElement = null
  svgElement: SVGSVGElement = null
  svg: d3.Selection<SVGSVGElement> = null
  board: d3.Selection<SVGGElement> = null
  zoom: d3.ZoomBehavior<Element, {}> = null
  heatmap: any = null

  componentDidMount() {
    const { floor } = this.props
    // 绘制地图
    drawFloor(floor, this.svgElement)
    this.svg = d3.select(this.svgElement)
    this.board = this.svg.select('.board')
    this.zoom = d3.zoom()
      .scaleExtent([0.2, 2])
      .on('zoom', this.onZoom)
    this.svg.call(this.zoom)

    this.heatmap = Heatmap.create({
      container: this.canvasWrapper,
      maxOpacity: 0.7,
      minOpacity: 0,
    })
    this.resetTransform(false)
  }

  componentWillReceiveProps(nextProps: Prop) {
    const { floor, items, transformReset } = this.props
    if (floor.floorId !== nextProps.floor.floorId) {
      drawFloor(nextProps.floor, this.svgElement)
    }
    if (!isSameItems(items, nextProps.items)
      || floor.floorId !== nextProps.floor.floorId) {
      this.updateHeatMap(nextProps.items)
    }
    if (!transformReset && nextProps.transformReset) {
      this.resetTransform(true)
    }
  }

  shouldComponentUpdate() {
    return false
  }

  onZoom = () => {
    this.board.attr('transform', d3.event.transform)
    this.updateHeatMap(this.props.items)
    this.props.onZoom()
  }

  resetTransform(useTransition = true) {
    const regionsLayerWrapper = this.svg.select('.regions-layer-wrapper').node() as SVGGElement
    const contentBox = regionsLayerWrapper.getBBox()
    const targetTransform = centralize(contentBox, {
      width: this.svgElement.clientWidth,
      height: this.svgElement.clientHeight,
    }, { top: 50, bottom: 50, left: 300, right: 300 })

    if (targetTransform) {
      this.zoom.transform(useTransition
        ? d3.select(this.svgElement).transition()
        : d3.select(this.svgElement) as any,
        targetTransform,
      )
    }
  }

  updateHeatMap(items: Location[]) {
    const transform = d3.zoomTransform(this.svgElement)
    this.heatmap.setData({
      max: this.props.span * config.maxPerMs,
      min: 0,
      data: items.map(({ x, y }) => ({
        x: Math.round(transform.applyX(x)),
        y: Math.round(transform.applyY(y)),
        value: 1,
        radius: transform.k * config.radius,
      })),
    })
  }

  render() {
    return (
      <div className="heat-map">
        <svg
          className="heap-map-svg"
          style={{ width: '100%', height: '100%' }}
          ref={node => (this.svgElement = node)}
        >
          <g className="board">
            <g className="regions-layer-wrapper" />
            <g className="texts-layer-wrapper" />
          </g>
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{ height: '100%' }}
            ref={node => (this.canvasWrapper = node)}
          />
        </div>
      </div>
    )
  }
}
