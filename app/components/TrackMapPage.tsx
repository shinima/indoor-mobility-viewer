import * as React from 'react'
import * as _ from 'lodash'
import * as moment from 'moment'
import { Moment } from 'moment'
import { connect } from 'react-redux'
import { fromJS, Map, OrderedMap } from 'immutable'
import { Dispatch } from 'redux'
import TrackMap from '../components/Map/TrackMap'
import TrackDetailPanel from '../components/TrackDetailPanel'
import FloorList from '../components/FloorList'
import ButtonGroup from '../components/ButtonGroup'
import bindSearchParameters, { SearchParamBinding } from '../utils/bindSearchParameters'
import { IComponent } from '../utils/utils'
import MacList from '../components/MacList'
import '../styles/TrackMapPage.styl'

const defaultDate = '2017-06-20'

type Def = {
  floorId: number
  date: Moment | string
  t: number
}

function mapStateToProps({ allTracks, allItems, floors, floorConfig }: S.State, ownProps: Def) {
  // calculate floor from floors and floorId
  const { floorId } = ownProps
  const floor = floors.find(flr => flr.floorId === floorId) || floors[0]

  return Object.assign({ allTracks, allItems, floors, floorConfig, floor }, ownProps)
}

function dateGetter(arg: string): string | Moment {
  if (arg === 'test-date') {
    return arg
  } else {
    const date = moment(arg, 'YYYY-M-D')
    if (date.isValid()) {
      return date
    } else {
      return 'test-date'
    }
  }
}

const searchBindingDefinitions = [
  { key: 'floorId', getter: Number, default: null },
  { key: 'htid', getter: Number, default: null },
  { key: 'date', getter: dateGetter, default: 'test-date' },
  { key: 't', getter: Number, default: moment(defaultDate).valueOf() },
]

type P = SearchParamBinding<Def> & {
  allTracks: Track[]
  allItems: LocationItem[]
  floors: Floor[]
  floorConfig: S.FloorConfig
  floor: Floor
  dispatch: Dispatch<S.State>
}

interface S {
  macEntryMap: OrderedMap<string, boolean>
  ctid: number
  time: number
  showPath: boolean
  showPoints: boolean
  transformReset: boolean
}

class TrackMapPage extends IComponent<P, S> {
  state = {
    // mac地址过滤控件的状态
    macEntryMap: (localStorage.getItem('mac-list') === null
      ? OrderedMap()
      : OrderedMap(JSON.parse(localStorage.getItem('mac-list')))) as OrderedMap<string, boolean>,
    // centralized-track-id
    ctid: null as number,

    // 时间线
    time: 0,

    showPath: true,
    showPoints: true,
    // transform是否重置(大概等于当前楼层是否居中显示)
    transformReset: false,
  }

  onDeleteMacEntry = (mac: string) => {
    const { macEntryMap } = this.state
    const newMacEntryMap = macEntryMap.delete(mac)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))
  }

  onAddMacEntry = (mac: string) => {
    const { macEntryMap } = this.state
    const { t } = this.props
    const newMacEntryMap = macEntryMap.set(mac, true)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))
  }

  onChangeFloorId = (floorId: number) => {
    this.props.updateSearch({ floorId })
  }

  onChangeTime = (time: number) => {
    if (time === 0) {
      this.setState({ time })
    } else {
      const { floorId, allTracks } = this.props
      const nextTrack = allTracks.find(tr => (tr.startTime <= time && time <= tr.endTime))
      if (nextTrack && floorId !== nextTrack.floorId) {
        this.onChangeFloorId(nextTrack.floorId)
        this.setState({ time })
        this.onCentralizeTrack(nextTrack.trackId)
      } else {
        this.setState({ time })
      }
    }
  }

  onCentralizeTrack = (trackId: number) => {
    this.setState({ ctid: trackId, showPath: true })
  }

  onToggleMacEntry = (mac: string) => {
    const { macEntryMap } = this.state
    const not = (x: any) => !x
    const newMacEntryMap = macEntryMap.update(mac, not)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))
  }

  // 居中显示一个macName在当前楼层的第一个轨迹
  onCentralizeFirstTrack = (mac: string) => {
    const { allTracks, floor } = this.props
    const centralizedTrack = allTracks.find(tr => (tr.floorId === floor.floorId && tr.mac === mac))
    if (centralizedTrack) {
      this.setState({ ctid: centralizedTrack.trackId })
    }
  }

  render() {
    const { allTracks, allItems, floorConfig, floor, history } = this.props
    const {
      time,
      ctid,
      macEntryMap,
      transformReset,
      showPath,
      showPoints,
    } = this.state

    const activeMacSet = macEntryMap.filter(Boolean)
      .keySeq()
      .toSet()
    const visibleTracks = allTracks
      .filter(track => track.floorId === floor.floorId)
      .filter(track => activeMacSet.has(track.mac))

    const visibleItems = allItems
      .filter(item => item.floorId === floor.floorId)
      .filter(item => activeMacSet.has(item.mac))

    const activeTracks = allTracks.filter(track => activeMacSet.has(track.mac))
    const activeTrackPoints = _.flatten(activeTracks.map(track => track.points))
    const countResult = _.countBy(activeTrackPoints, trackPoint => trackPoint.floorId)
    const floorEntryList = fromJS(floorConfig).map((entry: Map<string, number | string>) => (
      entry.set('pointsCount', countResult[entry.get('floorId')] || 0)
    )) as Map<string, number | string>

    return (
      <div>
        <div className="widgets">
          <ButtonGroup
            onResetTransform={() => this.setState({ transformReset: true })}
            showPath={showPath}
            showPoints={showPoints}
            onToggleShowPath={() => this.setState({ showPath: !showPath })}
            onToggleShowPoints={() => this.setState({ showPoints: !showPoints })}
            history={history}
          />
          <MacList
            macEntryMap={macEntryMap}
            onDeleteMacEntry={this.onDeleteMacEntry}
            onAddMacEntry={this.onAddMacEntry}
            onToggleMacEntry={this.onToggleMacEntry}
            onCentralizeFirstTrack={this.onCentralizeFirstTrack}
            translate={_.identity}
          />
          <FloorList
            selectedFloorId={floor.floorId}
            floorEntryList={floorEntryList}
            changeSelectedFloorId={this.onChangeFloorId}
          />
        </div>
        <TrackMap
          time={time}
          floor={floor}
          tracks={visibleTracks}
          items={visibleItems}
          showPath={showPath}
          showPoints={showPoints}
          ctid={ctid}
          transformReset={transformReset}
          onChangeTime={this.onChangeTime}
          humanize={_.identity}
          onZoom={() => this.setState({ ctid: null, transformReset: false })}
        />
        <TrackDetailPanel
          time={time}
          onChangeTime={this.onChangeTime}
          tracks={allTracks}
          onCentralizeTrack={this.onCentralizeTrack}
        />
      </div>
    )
  }
}

export default bindSearchParameters(searchBindingDefinitions)(connect(mapStateToProps)(TrackMapPage))
