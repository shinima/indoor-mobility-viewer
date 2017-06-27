import React, { Component } from 'react'
import DrawingManager from './DrawingManager'
import '../../styles/Map.styl'
import floor from '../../resources/floor-31.json'
import allItems from '../../resources/items.json'

const items = allItems.filter(item => item.floorId === 31)

export default class TrackMap extends Component {
  componentDidMount() {
    const drawingManager = new DrawingManager(this.svg)
    drawingManager.updateFloor(floor)
    drawingManager.updateItems(items)
  }

  svg = null

  render() {
    return (
      <div className="track-map">
        <div className="tooltip-wrapper" />
        <svg
          className="track-map-svg"
          style={{ width: '100%', height: '100%' }}
          ref={node => (this.svg = node)}
        >
          <g className="board">
            <g className="regions-layer-wrapper" />
            <g className="texts-layer-wrapper" />
            <g className="items-layer" />
            <g className="path-layer" />
          </g>
        </svg>
      </div>
    )
  }
}
