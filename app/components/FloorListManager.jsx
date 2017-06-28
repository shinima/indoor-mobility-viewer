import React, { Component } from 'react'
import FloorList from '../components/FloorList'

export default class FloorListManager extends Component {
  render() {
    const floorDataArray = [
      { floorId: 31, buildingFloor: 'B-1' },
      { floorId: 32, buildingFloor: 'B-2' },
      { floorId: 33, buildingFloor: 'B-3' },
      { floorId: 34, buildingFloor: 'B-4' },
      { floorId: 35, buildingFloor: 'B-5' },
      { floorId: 36, buildingFloor: 'B-6' },
      { floorId: 61, buildingFloor: 'B-7' },
    ]
    return (
      <FloorList floorDataArray={floorDataArray} />
    )
  }
}
