import React, { Component } from 'react'
import '../styles/FloorList.styl'

export default class FloorList extends Component {
  render() {
    const { floorDataArray, selectedFloorId, changeSelectedFloorId } = this.props

    return (
      <div className="widgets">
        <div className="floor-list-widget">
          <div className="title">楼层地图切换</div>
          <div className="floor-list">
            {floorDataArray.map((item, index) => (
              <div
                key={index}
                className="floor-item"
                onClick={() => changeSelectedFloorId(item.floorId)}
              >
                <div className="bar" style={{ background: 'rgba(0, 255, 0, 25)' }} />
                <div className="floor-text">
                  <span>{item.buildingFloor}</span>
                  <span className="count">0</span>
                </div>
                <input
                  className="floor-radio"
                  type="radio"
                  checked={selectedFloorId === item.floorId}
                  readOnly
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}
