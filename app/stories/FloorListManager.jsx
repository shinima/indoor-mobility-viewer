import React, { Component } from 'react'
import _ from 'lodash'
import { Map } from 'immutable'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { floorConfig } from '../resources/floors'
import allItems from '../resources/items.json'
import FloorList from '../components/FloorList'

const floorCount = Map(Object.entries(_.groupBy(allItems, item => item.floorId))
  .map(item => ({
    floorId: item[0],
    count: item[1].length,
  })).map(({ floorId, count }) => [floorId, count]))

function getFloorCount(floorId) {
  const count = floorCount.get(`${floorId}`)
  return typeof (count) === 'undefined' ? 0 : count
}

const defaultFloorEntryMap = Map(floorConfig.map(({ floorId, floorName }) =>
  [floorId, [floorName, getFloorCount(floorId)]]))

class FloorListManager extends Component {
  state = {
    // 默认选择floorDataArray中的第一项作为默认项
    selectedFloorId: this.props.floorDataArray.keyOf(this.props.floorDataArray.first()),
  }

  render() {
    const { selectedFloorId } = this.state
    const { floorDataArray } = this.props
    return (
      <FloorList
        floorDataArray={floorDataArray}
        selectedFloorId={selectedFloorId}
        changeSelectedFloorId={floorId => this.setState({ selectedFloorId: floorId })}
      />
    )
  }
}

storiesOf('FloorListManager', module)
  .add('static', () => (
    <FloorList
      selectedFloorId={31}
      floorDataArray={defaultFloorEntryMap}
      changeSelectedFloorId={action('change-selected-floor-id')}
    />
  ))
  .add('interactive', () => (
    <FloorListManager
      floorDataArray={defaultFloorEntryMap}
    />
  ))
