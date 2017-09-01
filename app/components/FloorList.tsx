import * as React from 'react'
import * as d3 from 'd3'
import { List, Map } from 'immutable'
import * as classNames from 'classnames'
import '../styles/FloorList.styl'

const statsBgColor = d3.scaleLinear<d3.HSLColor>()
  .clamp(true)
  // green/0.1 -> red/0.4
  .range([d3.hsl('rgba(0,255,0,0.1)'), d3.hsl('rgba(255,0,0,0.4)')])
  .interpolate(d3.interpolateHsl)
const statsBarWidth = d3.scaleLinear().range([0, 300]).clamp(true)

type P = {
  max?: number
  floorEntryList: any // todo
  selectedFloorId: number
  changeSelectedFloorId: (floorId: number) => void
}

export default class FloorList extends React.Component<P> {
  // static propTypes = {
  //   max: PropTypes.number,
  //   floorEntryList: ImmutablePropTypes.iterableOf(ImmutablePropTypes.mapContains({
  //     floorId: PropTypes.number.isRequired,
  //     floorName: PropTypes.string.isRequired,
  //     pointsCount: PropTypes.number.isRequired,
  //   }).isRequired).isRequired,
  //   changeSelectedFloorId: PropTypes.func.isRequired,
  //   selectedFloorId: PropTypes.number.isRequired,
  // }

  render() {
    const {
      floorEntryList,
      selectedFloorId,
      changeSelectedFloorId,
      max = floorEntryList.map((entry: any) => entry.get('pointsCount')).max(),
    } = this.props
    statsBgColor.domain([1, max])
    statsBarWidth.domain([0, max])

    return (
      <div className="floor-list-widget">
        <div className="title">楼层热度</div>
        <div className="floor-list">
          {floorEntryList.map((entry: any) => (
            <div
              key={entry.get('floorId')}
              className={classNames('floor-item', { active: selectedFloorId === entry.get('floorId') })}
              onClick={() => changeSelectedFloorId(entry.get('floorId'))}
            >
              <div
                className="bar"
                style={{
                  width: statsBarWidth(entry.get('pointsCount')),
                  background: statsBgColor(entry.get('pointsCount')),
                }}
              />
              <div className="floor-name">
                {entry.get('floorName')}
              </div>
              <div className="points-count">
                {entry.get('pointsCount')}
              </div>
            </div>
          )).toArray()}
        </div>
      </div>
    )
  }
}
