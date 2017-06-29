import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import FloorList from '../components/FloorList'

class FloorListManager extends Component {
  state = {
    selectedFloorId: this.props.floorDataArray[0].floorId,
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
      floorDataArray={[
        { floorId: 31, buildingFloor: 'B-1' },
        { floorId: 32, buildingFloor: 'B-2' },
        { floorId: 33, buildingFloor: 'B-3' },
        { floorId: 34, buildingFloor: 'B-4' },
        { floorId: 35, buildingFloor: 'B-5' },
        { floorId: 36, buildingFloor: 'B-6' },
        { floorId: 61, buildingFloor: 'B-7' },
      ]}
      changeSelectedFloorId={action('change-selected-floor-id')}
    />
  ))
  .add('interactive', () => (
    <FloorListManager
      floorDataArray={[
        { floorId: 31, buildingFloor: 'B-1' },
        { floorId: 32, buildingFloor: 'B-2' },
        { floorId: 33, buildingFloor: 'B-3' },
        { floorId: 34, buildingFloor: 'B-4' },
        { floorId: 35, buildingFloor: 'B-5' },
        { floorId: 36, buildingFloor: 'B-6' },
        { floorId: 61, buildingFloor: 'B-7' },
      ]}
    />
  ))
