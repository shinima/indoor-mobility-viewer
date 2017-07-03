import React, { Component } from 'react'
import * as d3 from 'd3'
import '../styles/FloorList.styl'

const statsBgColor = d3.scaleLinear()
    .clamp(true)
    // green/0.1 -> red/0.4
    .range([d3.hsl('rgba(0,255,0,0.1)'), d3.hsl('rgba(255,0,0,0.4)')])
    .interpolate(d3.interpolateHsl)
const statsBarWidth = d3.scaleLinear().range([0, 200]).clamp(true)

export default class FloorList extends Component {
  render() {
    const { floorDataArray, selectedFloorId, changeSelectedFloorId, getFloorCount } = this.props

    return (
      <div className="floor-list-widget">
        <div className="title">楼层地图切换</div>
        <div className="floor-list">
          {floorDataArray.map((floorName, floorId) => (
            <div
              key={floorId}
              className="floor-item"
              onClick={() => changeSelectedFloorId(floorId)}
            >
              <div className="bar" style={{ background: 'rgba(0, 255, 0, 25)' }} />
              <div className="floor-text">
                <span>{floorName}</span>
                <span className="count">{getFloorCount(floorId)}</span>
              </div>
              <input
                className="floor-radio"
                type="radio"
                checked={selectedFloorId === floorId}
                readOnly
              />
            </div>
          ))}
        </div>
      </div>
    )
  }
}
