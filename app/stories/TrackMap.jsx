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

const allTrackMatrix = Map(_.groupBy(allItems, item => item.mac))
  .map(cluster)
  .toArray()

const filteredTrackMatrix = allTrackMatrix.map(tracks => (
  tracks.filter(track => track.floorId === floor.floorId)
))

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
          trackMatrix={filteredTrackMatrix}
          showPath
          showPoints
          htid={htid}
          htpid={htpid}
        />
        <TrackDetailPanel
          macs={fromJS(staticMacMapping).map(m => m.get('mac'))}
          hmac={hmac}
          onChangeHmac={hmac => this.setState({ hmac })}
          tracks={allTrackMatrix.find(tracks => (
            tracks[0].mac === hmac
          ))}
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
      trackMatrix={filteredTrackMatrix}
      showPath
      showPoints
      htid={null}
    />
  ))
  .add('full', () => <InteractiveTrackMap floor={floor} />)
