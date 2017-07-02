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
    // highlighted-mac-name 即想要查看当天轨迹的macName
    hmacName: 'sfc-samsung',
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
    this.setState({ floor: nextFloor })
  }

  onChangeHmacName = (hmacName) => {
    this.setState({ hmacName })
    // 将对应的macEntry的设置为active
    this.updateMacEntryList(list => list.map((entry) => {
      if (entry.get('name') === hmacName) {
        return entry.set('active', true)
      } else {
        return entry
      }
    }))
  }

  onCentralizeTrack = (trackId) => {
    this.setState({ ctid: trackId })
  }

  onToggleItem = (macName) => {
    const { macEntryList, hmacName } = this.state
    let nextHmacName = hmacName
    if (macName === hmacName) {
      const entry = macEntryList.find(entry => entry.get('name') === macName)
      if (entry.get('active')) {
        // 如果当前这个mac是高亮的mac地址, 那么当用户将其设置为inactive的时候, 我们需要清空hmacName
        nextHmacName = null
      }
    }
    const nextMacEntryList = macEntryList.map((entry) => {
      if (entry.get('name') === macName) {
        return entry.set('active', !entry.get('active'))
      } else {
        return entry
      }
    })
    this.setState({
      hmacName: nextHmacName,
      macEntryList: nextMacEntryList,
    })
  }

  onChangeHtid = (htid) => {
    this.setState({ htid })
    if (htid != null) {
      const track = allTracks.find(tr => tr.trackId === htid)
      this.setState({ hmacName: this.humanize(track.mac) })
    }
  }
  onChangeHtpid = htpid => this.setState({ htpid })

  renderTrackDetailPanel(hmac) {
    if (hmac != null) {
      const { hmacName, floor, htpid } = this.state
      return (
        <TrackDetailPanel
          hmacName={hmacName}
          tracks={allTracks.filter(track => (track.mac === hmac))}
          floorId={floor.floorId}
          onChangeFloorId={this.changeFloorId}
          onChangeHtid={this.onChangeHtid}
          htpid={htpid}
          onChangeHtpid={this.onChangeHtpid}
          onChangeHmacName={this.onChangeHmacName}
          onCentralizeTrack={this.onCentralizeTrack}
        />
      )
    } else {
      return null
    }
  }

  render() {
    const { hmacName, htid, ctid, htpid, floor, macEntryList } = this.state

    const hmac = this.translate(hmacName)
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
            onChangeHmacName={this.onChangeHmacName}
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
        {this.renderTrackDetailPanel(hmac)}
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
