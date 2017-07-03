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
    macEntryMap: Map(staticMacMapping.map(({ name }) => [name, true])),
    // highlighted-track-id
    htid: null,
    // centralized-track-id
    ctid: null,
    // highlighted-track-point-id
    htpid: null,
  }

  updateMacEntryMap = this.makeIUpdateFn('macEntryMap')
  translate = makeTranslateFn(staticMacMapping)
  humanize = makeHumanizeFn(staticMacMapping)

  onDeleteMacEntry = (macName) => {
    this.updateMacEntryMap(map => map.delete(macName))

    // 如果当前高亮的轨迹正好要被删除, 那么将htid设置为null
    const { htid, macEntryMap } = this.state
    if (htid != null && macEntryMap.get(macName)) {
      const highlightedTrack = allTracks.find(tr => tr.trackId === htid)
      if (highlightedTrack.mac === this.translate(macName)) {
        this.setState({ htid: null })
      }
    }
  }

  onAddMacEntry = (macName) => {
    this.updateMacEntryMap(map => map.set(macName, true))
  }

  changeFloorId = (floorId) => {
    const nextFloor = floors.find(flr => flr.floorId === floorId)
    this.setState({ floor: nextFloor, htid: null })
  }

  onCentralizeTrack = (trackId) => {
    this.setState({ ctid: trackId })
  }

  onToggleMacEntry = (macName) => {
    const not = x => !x
    this.updateMacEntryMap(map => map.update(macName, not))

    // 如果当前高亮的轨迹正好要设置为不可见, 那么将htid设置为null
    const { htid, macEntryMap } = this.state
    if (htid != null && macEntryMap.get(macName)) {
      const highlightedTrack = allTracks.find(tr => tr.trackId === htid)
      if (highlightedTrack.mac === this.translate(macName)) {
        this.setState({ htid: null })
      }
    }
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
    const { htid, ctid, htpid, floor, macEntryMap } = this.state

    const activeMacSet = macEntryMap.filter(Boolean)
      .keySeq()
      .map(this.translate)
      .toSet()
    const visibleTracks = allTracks
      .filter(track => track.floorId === floor.floorId)
      .filter(track => activeMacSet.has(track.mac))

    return (
      <div>
        <div className="widgets">
          <MacList
            macEntryMap={macEntryMap}
            onDeleteMacEntry={this.onDeleteMacEntry}
            onAddMacEntry={this.onAddMacEntry}
            onToggleMacEntry={this.onToggleMacEntry}
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
      ctid={null}
      htpid={null}
      onChangeHtid={action('change-highlighted-track-id')}
      onChangeHtpid={action('change-highlighted-track-point-id')}
      humanize={makeHumanizeFn(staticMacMapping)}
      onZoom={action('zoom')}
    />
  ))
  .add('TrackMapPage', () => <TrackMapPage />)
