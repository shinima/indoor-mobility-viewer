/* eslint-disable no-shadow */
import React, { Component } from 'react'
import _ from 'lodash'
import { fromJS, Map } from 'immutable'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import TrackMap from '../components/Map/TrackMap'
import '../styles/global.styl'
import allItems from '../resources/items.json'
import staticMacMapping from '../resources/static-mac-mapping.json'
import cluster from '../components/Map/cluster'
import TrackDetailPanel from '../components/TrackDetailPanel'
import FloorList from '../components/FloorList'
import floor31 from '../resources/floor-31.json'
import floors from '../resources/floors'

const allTracks = Map(_.groupBy(allItems, item => item.mac))
  .toList()
  .flatMap(cluster)
  .toArray()

class InteractiveTrackMap extends Component {
  state = {
    floor: _.first(floors),
    // highlighted-mac
    hmac: 'c8:1e:e7:c1:1e:72',
    // highlighted-track-id
    htid: null,
    // highlighted-track-point-id
    htpid: null,
  }

  changeFloorId = (floorId) => {
    const nextFloor = floors.find(flr => flr.floorId === floorId)
    this.setState({ floor: nextFloor })
  }

  render() {
    const { hmac, htid, htpid, floor } = this.state

    return (
      <div>
        <FloorList
          selectedFloorId={floor.floorId}
          // todo 相关的prop需要修改一下
          floorDataArray={[
            { floorId: 31, buildingFloor: 'B-1' },
            { floorId: 32, buildingFloor: 'B-2' },
            { floorId: 33, buildingFloor: 'B-3' },
            { floorId: 34, buildingFloor: 'B-4' },
            { floorId: 35, buildingFloor: 'B-5' },
            { floorId: 36, buildingFloor: 'B-6' },
            { floorId: 61, buildingFloor: 'B-7' },
          ]}
          changeSelectedFloorId={this.changeFloorId}
        />
        <TrackMap
          floor={floor}
          tracks={allTracks.filter(track => track.floorId === floor.floorId)}
          showPath
          showPoints
          htid={htid}
          htpid={htpid}
        />
        <TrackDetailPanel
          macs={fromJS(staticMacMapping).map(m => m.get('mac'))}
          hmac={hmac}
          onChangeHmac={hmac => this.setState({ hmac })}
          tracks={allTracks.filter(track => (track.mac === hmac))}
          floorId={floor.floorId}
          onChangeFloorId={this.changeFloorId}
          onChangeHtid={htid => this.setState({ htid })}
          htpid={htpid}
          onChangeHtpid={htpid => this.setState({ htpid })}
        />
      </div>
    )
  }
}

storiesOf('TrackMap', module)
  .add('static', () => (
    <TrackMap
      floor={floor31}
      tracks={allTracks.filter(track => track.floorId === floor31.floorId)}
      showPath
      showPoints
      htid={null}
    />
  ))
  .add('full', () => <InteractiveTrackMap />)
