import * as React from 'react'
import * as d3 from 'd3'
import { List, Record } from 'immutable'
import '../styles/FloorList.styl'

const statsBgColor = d3.scaleLinear<d3.HSLColor>()
  .clamp(true)
  // green/0.1 -> red/0.4
  .range([d3.hsl('rgba(0,255,0,0.1)'), d3.hsl('rgba(255,0,0,0.4)')])
  .interpolate(d3.interpolateHsl)
const statsBarWidth = d3.scaleLinear().range([0, 300]).clamp(true)

interface P {
  floorEntryList: List<FloorEntryRecord>
  selectedFloorId: number
  changeSelectedFloorId: (floorId: number) => void
  max?: number
}

export const FloorEntryRecord = Record({
  floorId: 0,
  floorName: '',
  count: 0,
})
const floorEntryRecord = FloorEntryRecord()
export type FloorEntryRecord = typeof floorEntryRecord

export const add = (s: number, c: number) => s + c

function getDefaultMax(floorEntryList: List<FloorEntryRecord>) {
  const countList = floorEntryList.map(entry => entry.count)
  const sum = countList.reduce(add, 0)
  const avg = sum / countList.size
  return Math.max(countList.max(), avg * 2)
}

export default class FloorList extends React.Component<P> {
  render() {
    const {
      floorEntryList,
      selectedFloorId,
      changeSelectedFloorId,
      max = getDefaultMax(floorEntryList),
    } = this.props

    statsBgColor.domain([1, max])
    statsBarWidth.domain([0, max])

    return (
      <div className="floor-list-widget">
        <div className="title">Floor Chooser</div>
        <div className="subtitle">
          <p>Floor Name</p>
          <p>Number of Raw Records</p>
        </div>
        <div className="floor-list">
          {floorEntryList.map(entry => (
            <div
              key={entry.floorId}
              className={`floor-item${selectedFloorId === entry.floorId ? ' active' : ''}`}
              onClick={() => changeSelectedFloorId(entry.floorId)}
            >
              <div
                className="bar"
                style={{
                  width: statsBarWidth(entry.count),
                  background: statsBgColor(entry.count),
                }}
              />
              <div className="floor-name">
                {entry.floorName}
              </div>
              <div className="count">{entry.count}</div>
            </div>
          )).toArray()}
        </div>
      </div>
    )
  }
}
