/* eslint-disable no-shadow */
import React from 'react'
import _ from 'lodash'
import { fromJS, Map } from 'immutable'
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
import ButtonGroup from '../stories/ButtonGroup'
import Legend from '../stories/Legend'
import floor31 from '../resources/floor-31.json'
import floors, { floorConfig } from '../resources/floors'
import { IComponent, makeHumanizeFn, makeTranslateFn } from '../utils/utils'
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
    showPath: true,
    showPoints: true,
    // transform是否重置(大概等于当前楼层是否居中显示)
    transformReset: false,
  }

  updateFloorEntryMap = this.makeIUpdateFn('items')
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
    this.setState({ floor: nextFloor })
  }

  onCentralizeTrack = (trackId) => {
    this.setState({ ctid: trackId, showPath: true })
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

  // 高亮一个macName在当前楼层的第一条轨迹
  onHighlightFirstTrack = (macName) => {
    const mac = this.translate(macName)
    const { floor, macEntryMap } = this.state
    const highlightedTrack = allTracks.find(tr => (tr.floorId === floor.floorId && tr.mac === mac))
    if (highlightedTrack) {
      this.setState({
        htid: highlightedTrack.trackId,
        macEntryMap: macEntryMap.set(macName, true),
      })
    }
    // todo else 没有找到轨迹的话, 需要使用toast来提示用户
  }

  // 居中显示一个macName在当前楼层的第一个轨迹
  onCentralizeFirstTrack = (macName) => {
    const mac = this.translate(macName)
    const { floor } = this.state
    const centralizedTrack = allTracks.find(tr => (tr.floorId === floor.floorId && tr.mac === mac))
    if (centralizedTrack) {
      this.setState({ ctid: centralizedTrack.trackId })
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
    const {
      htid,
      ctid,
      htpid,
      floor,
      macEntryMap,
      transformReset,
      showPath,
      showPoints,
    } = this.state

    const activeMacSet = macEntryMap.filter(Boolean)
      .keySeq()
      .map(this.translate)
      .toSet()
    const visibleTracks = allTracks
      .filter(track => track.floorId === floor.floorId)
      .filter(track => activeMacSet.has(track.mac))

    const activeTracks = allTracks.filter(track => activeMacSet.has(track.mac))
    const activeTrackPoints = _.flatten(activeTracks.map(track => track.points))
    const countResult = _.countBy(activeTrackPoints, trackPoint => trackPoint.floorId)
    const floorEntryList = fromJS(floorConfig).map(entry => (
      entry.set('trackPointCount', countResult[entry.get('floorId')] || 0)
    ))

    return (
      <div>
        <div className="widgets">
          <ButtonGroup
            onResetTransform={() => this.setState({ transformReset: true })}
            showPath={showPath}
            showPoints={showPoints}
            onToggleShowPath={() => this.setState({ showPath: !showPath })}
            onToggleShowPoints={() => this.setState({ showPoints: !showPoints })}
          />
          <Legend />
          <MacList
            macEntryMap={macEntryMap}
            onDeleteMacEntry={this.onDeleteMacEntry}
            onAddMacEntry={this.onAddMacEntry}
            onToggleMacEntry={this.onToggleMacEntry}
            onHighlightFirstTrack={this.onHighlightFirstTrack}
            onCentralizeFirstTrack={this.onCentralizeFirstTrack}
            translate={this.translate}
          />
          <FloorList
            selectedFloorId={floor.floorId}
            floorEntryList={floorEntryList}
            changeSelectedFloorId={this.changeFloorId}
          />
        </div>
        <TrackMap
          floor={floor}
          tracks={visibleTracks}
          showPath={showPath}
          showPoints={showPoints}
          htid={htid}
          ctid={ctid}
          transformReset={transformReset}
          htpid={htpid}
          onChangeHtid={this.onChangeHtid}
          onChangeHtpid={this.onChangeHtpid}
          humanize={this.humanize}
          onZoom={() => this.setState({ ctid: null, transformReset: false })}
        />
        {this.renderTrackDetailPanel()}
      </div>
    )
  }
}

storiesOf('TrackMap', module)
  .add(' static', () => (
    <TrackMap
      floor={floor31}
      tracks={allTracks.filter(track => track.floorId === floor31.floorId)}
      showPath
      showPoints
      htid={null}
      ctid={null}
      htpid={null}
      onChangeHtid={action(' change-highlighted-track-id')}
      onChangeHtpid={action(' change-highlighted-track-point-id')}
      humanize={makeHumanizeFn(staticMacMapping)}
      onZoom={action(' zoom')}
    />
  ))
  .add(' TrackMapPage', () => <TrackMapPage />)
