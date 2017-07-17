import React, { Component } from 'react'
import { fromJS } from 'immutable'
import _ from 'lodash'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import HeatMap from '../components/Map/HeatMap'
import allItems from '../resources/items.json'
import floor31 from '../resources/floor-31.json'
import floors, { floorConfig } from '../resources/floors'
import FloorList from '../components/FloorList'

class HeatMapPage extends Component {
  state = {
    // 当前显示的楼层
    floor: _.first(floors),
    // transform是否重置(大概等于当前楼层是否居中显示)
    transformReset: false,
  }

  changeFloorId = (floorId) => {
    const nextFloor = floors.find(flr => flr.floorId === floorId)
    this.setState({ floor: nextFloor })
  }

  render() {
    const { floor } = this.state

    const floorEntryList = fromJS(floorConfig).map(entry => entry.set('pointsCount', 0))

    return (
      <div>
        <div className="widgets">
          <FloorList
            selectedFloorId={floor.floorId}
            floorEntryList={floorEntryList}
            changeSelectedFloorId={this.changeFloorId}
          />
        </div>
        <HeatMap
          floor={floor}
          items={allItems.filter(item => item.floorId === floor.floorId)}
          onZoom={() => this.setState({ transformReset: false })}
        />
      </div>
    )
  }
}

storiesOf('HeatMap', module)
  .add('static', () => (
    <HeatMap
      floor={floor31}
      items={allItems.filter(item => item.floorId === floor31.floorId)}
      startTime
      endTime
      onZoom={action('zoom')}
    />
  ))
  .add('HeatMapPage', () => <HeatMapPage />)
