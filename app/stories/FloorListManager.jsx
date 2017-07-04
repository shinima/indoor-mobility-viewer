import React, { Component } from 'react'
import _ from 'lodash'
import { Map, List, fromJS } from 'immutable'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { floorConfig } from '../resources/floors'
import { getFloorCount } from '../utils/utils'
import cluster from '../components/Map/cluster'
import allItems from '../resources/items.json'
import FloorList from '../components/FloorList'

const allTrackPoints = Map(_.groupBy(allItems, item => item.mac))
  .toList()
  .flatMap(cluster)
  .flatMap(track => track.points)
  .toArray()

const countResult = _.countBy(allTrackPoints, trackPoint => trackPoint.floorId)
const floorEntryList = fromJS(floorConfig).map(entry => (
  entry.set('trackPointCount', countResult[entry.get('floorId')] || 0)
))

class FloorListManager extends Component {
  state = {
    // 默认选择floorDataArray中的第一项作为默认项
    selectedFloorId: this.props.floorEntryList.first().get('floorId'),
  }

  render() {
    const { selectedFloorId } = this.state
    const { floorEntryList } = this.props
    return (
      <FloorList
        floorEntryList={floorEntryList}
        selectedFloorId={selectedFloorId}
        changeSelectedFloorId={floorId => this.setState({ selectedFloorId: floorId })}
      />
    )
  }
}

storiesOf('FloorListManager', module)
  .add('static', () => (
    <FloorList
      selectedFloorId={floorEntryList.first().get('floorId')}
      floorEntryList={floorEntryList}
      changeSelectedFloorId={action('change-selected-floor-id')}
    />
  ))
  .add('interactive', () => (
    <FloorListManager
      floorEntryList={floorEntryList}
    />
  ))
