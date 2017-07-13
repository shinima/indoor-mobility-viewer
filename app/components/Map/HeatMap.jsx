import React, { Component } from 'react'
import * as d3 from 'd3'
import Heatmap from 'heatmap.js'
import drawFloor from './drawFloor'
import centralize from './centralize'
import { isSameItems } from './utils'

const config = {
  radius: 40,
}

export default class HeatMap extends Component {
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

  componentWillReceiveProps(nextProps) {
    const { floor, items, transformReset } = this.props
    if (floor.floorId !== nextProps.floorId) {
      drawFloor(nextProps.floor, this.svgElement)
    }
    if (!isSameItems(items, nextProps.items
      || floor.floorId !== nextProps.floor.floorId)) {
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
    const regionsLayerWrapper = this.svg.select('.regions-layer-wrapper').node()
    const contentBox = regionsLayerWrapper.getBBox()
    const targetTransform = centralize(contentBox, {
      width: this.svgElement.clientWidth,
      height: this.svgElement.clientHeight,
    }, { top: 50, bottom: 50, left: 300, right: 300 })

    if (targetTransform) {
      this.zoom.transform(useTransition
        ? d3.select(this.svgElement).transition()
        : d3.select(this.svgElement),
        targetTransform,
      )
    }
  }

  updateHeatMap(items) {
    // console.log('update-heat-map')
    const transform = d3.zoomTransform(this.svgElement)
    // todo 可以把看不见的点先去掉
    this.heatmap.setData({
      // todo max的值应该与 时间长短有关
      max: items.length / 100,
      min: 0,
      data: items.map(({ x, y }) => ({
        x: Math.round(transform.applyX(x)),
        y: Math.round(transform.applyY(y)),
        value: 1,
        radius: transform.k * config.radius,
      })),
    })
  }

  svgElement = null
  svg = null
  board = null
  zoom = null

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
