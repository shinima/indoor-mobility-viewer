/* eslint-disable no-shadow */
import React, { Component } from 'react'
import _ from 'lodash'
import { Set, fromJS, Map } from 'immutable'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import TrackMap from '../components/Map/TrackMap'
import '../styles/global.styl'
import '../styles/TrackMapPage.styl'
import allItems from '../resources/items.json'
import staticMacMapping from '../resources/static-mac-mapping.json'
import cluster from '../components/Map/cluster'
import TrackDetailPanel from '../components/TrackDetailPanel'
import FloorList from '../components/FloorList'
import floor31 from '../resources/floor-31.json'
import floors from '../resources/floors'
import { IComponent, makeTranslateFn, makeHumanizeFn } from '../utils/utils'
import MacList from '../components/MacList'

const allTracks = Map(_.groupBy(allItems, item => item.mac))
  .toList()
  .flatMap(cluster)
  .toArray()

class TrackMapPage extends IComponent {
  state = {
    // 当前显示的楼层
    floor: _.first(floors),
    // mac地址过滤控件的状态
    macEntryList: fromJS(staticMacMapping.map(item => ({
      name: item.name,
      active: true,
    }))),
    // highlighted-track-id
    htid: null,
    // centralized-track-id
    ctid: null,
    // highlighted-track-point-id
    htpid: null,
  }

  updateMacEntryList = this.makeIUpdateFn('macEntryList')
  translate = makeTranslateFn(staticMacMapping)
  humanize = makeHumanizeFn(staticMacMapping)

  changeFloorId = (floorId) => {
    const nextFloor = floors.find(flr => flr.floorId === floorId)
    this.setState({ floor: nextFloor, htid: null })
  }

  onCentralizeTrack = (trackId) => {
    this.setState({ ctid: trackId })
  }

  onToggleItem = (macName) => {
    this.updateMacEntryList(list => list.map((entry) => {
      if (entry.get('name') === macName) {
        return entry.set('active', !entry.get('active'))
      } else {
        return entry
      }
    }))
  }

  onChangeHtid = (htid) => {
    if (htid != null) {
      const { floor } = this.state
      // ht: highlighted-track
      const ht = allTracks.find(tr => tr.trackId === htid)
      if (floor.floorId === ht.floorId) {
        this.setState({ htid })
      } else {
        // 如果发生了楼层切换, 那么默认居中显示highlighted-track
        const nextFloor = floors.find(flr => flr.floorId === ht.floorId)
        this.setState({ htid, ctid: htid, floor: nextFloor })
      }
    } else {
      this.setState({ htid })
    }
  }
  onChangeHtpid = htpid => this.setState({ htpid })

  renderTrackDetailPanel() {
    const { floor, htid, htpid } = this.state
    if (htid != null) {
      // ht: highlighted track
      const ht = allTracks.find(tr => tr.trackId === htid)
      return (
        <TrackDetailPanel
          tracks={allTracks.filter(track => (track.mac === ht.mac))}
          floorId={floor.floorId}
          onChangeHtid={this.onChangeHtid}
          ht={ht}
          htid={htid}
          htpid={htpid}
          onChangeHtpid={this.onChangeHtpid}
          onCentralizeTrack={this.onCentralizeTrack}
          humanize={this.humanize}
        />
      )
    } else {
      return null
    }
  }

  render() {
    const { htid, ctid, htpid, floor, macEntryList } = this.state

    const activeMacSet = macEntryList
      .filter(entry => entry.get('active'))
      .map(entry => entry.get('name'))
      .map(this.translate)
      .toSet()
    const visibleTracks = allTracks
      .filter(track => track.floorId === floor.floorId)
      .filter(track => activeMacSet.has(track.mac))

    return (
      <div>
        <div className="widgets">
          <MacList
            macEntryList={macEntryList}
            deleteItem={(macName) => {
              this.updateMacEntryList(list => list.filterNot(entry => entry.get('name') === macName))
            }}
            addItem={(name) => {
              this.updateMacEntryList(list => list.push(Map({ name, active: true })))
            }}
            onToggleItem={this.onToggleItem}
            translate={this.translate}
          />
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
        </div>
        <TrackMap
          floor={floor}
          tracks={visibleTracks}
          showPath
          showPoints
          htid={htid}
          ctid={ctid}
          htpid={htpid}
          onChangeHtid={this.onChangeHtid}
          onChangeHtpid={this.onChangeHtpid}
          humanize={this.humanize}
          onZoom={() => this.setState({ ctid: null })}
        />
        {this.renderTrackDetailPanel()}
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
      htpid={null}
      onZoom={action('zoom')}
    />
  ))
  .add('TrackMapPage', () => <TrackMapPage />)
