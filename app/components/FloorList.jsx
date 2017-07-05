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
    const { floorEntryList, selectedFloorId, changeSelectedFloorId } = this.props
    const maxCount = floorEntryList.map(entry => entry.get('trackPointCount')).max()
    statsBgColor.domain([1, maxCount])
    statsBarWidth.domain([0, maxCount])

    return (
      <div className="floor-list-widget">
        <div className="title">楼层地图切换</div>
        <div className="floor-list">
          {floorEntryList.map(entry => (
            <div
              key={entry.get('floorId')}
              className="floor-item"
              onClick={() => changeSelectedFloorId(entry.get('floorId'))}
            >
              <div
                className="bar"
                style={{
                  width: statsBarWidth(entry.get('trackPointCount')),
                  background: statsBgColor(entry.get('trackPointCount')),
                }}
              />
              <div className="floor-text">
                <span>{entry.get('floorName')}</span>
                <span className="count">{entry.get('trackPointCount')}</span>
              </div>
              <div className="floor-radio">
                <img
                  style={{ width: '20px', height: '20px' }}
                  src={`/static/img/${
                    selectedFloorId === entry.get('floorId') ? 'check-radio' : 'empty-radio'}.svg`
                  }
                  alt="radio"
                />
              </div>
            </div>
          )).toArray()}
        </div>
      </div>
    )
  }
}
