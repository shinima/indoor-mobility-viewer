/* eslint-disable no-shadow */
import React, { Component } from 'react'
import _ from 'lodash'
import { fromJS, Map } from 'immutable'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import TrackMap from '../components/Map/TrackMap'
import '../styles/global.styl'
import allItems from '../resources/items.json'
import floor from '../resources/floor-31.json'
import staticMacMapping from '../resources/static-mac-mapping.json'
import cluster from '../components/Map/cluster'
import TrackDetailPanel from '../components/TrackDetailPanel'

const allTracks = Map(_.groupBy(allItems, item => item.mac))
  .toList()
  .flatMap(cluster)
  .toArray()

const filteredTracks = allTracks.filter(track => track.floorId === floor.floorId)

class InteractiveTrackMap extends Component {
  state = {
    // highlighted-mac
    hmac: 'c8:1e:e7:c1:1e:72',
    // highlighted-track-id
    htid: null,
    // highlighted-track-point-id
    htpid: null,
    currentFloorId: this.props.floor.floorId,
  }

  render() {
    const { hmac, currentFloorId, htid, htpid } = this.state

    return (
      <div>
        <TrackMap
          floor={floor}
          tracks={filteredTracks}
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
          currentFloorId={currentFloorId}
          onChangeFloorId={action('change-floor-id')}
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
      floor={floor}
      tracks={filteredTracks}
      showPath
      showPoints
      htid={null}
    />
  ))
  .add('full', () => <InteractiveTrackMap floor={floor} />)
