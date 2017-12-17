import * as React from 'react'
import * as _ from 'lodash'
import * as moment from 'moment'
import { connect } from 'react-redux'
import { fromJS, Map, OrderedMap } from 'immutable'
import { Dispatch } from 'redux'
import TrackMap from '../components/Map/TrackMap'
import FloorList from '../components/FloorList'
import ButtonGroup from '../components/ButtonGroup'
import bindSearchParameters, { SearchParamBinding } from '../utils/bindSearchParameters'
import { IComponent } from '../utils/utils'
import MacList from '../components/MacList'
import '../styles/TrackMapPage.styl'
import { FloorConfig, State } from '../reducer'
import TimelinePanel from './TimelinePanel'

const defaultDate = '2017-06-20'

type Def = {
  floorId: number
  t: number
}

function mapStateToProps({ rawTracks, semanticTracks, floors, floorConfig }: State, ownProps: Def) {
  // calculate floor from floors and floorId
  const { floorId } = ownProps
  const floor = floors.find(flr => flr.floorId === floorId) || floors[0]

  return Object.assign({ rawTracks, semanticTracks, floors, floorConfig, floor }, ownProps)
}

const searchBindingDefinitions = [
  { key: 'floorId', getter: Number, default: null },
  { key: 'htid', getter: Number, default: null },
  { key: 't', getter: Number, default: moment(defaultDate).valueOf() },
]

type P = SearchParamBinding<Def> & {
  rawTracks: Track[]
  semanticTracks: Track[]
  floors: Floor[]
  floorConfig: FloorConfig
  floor: Floor
  dispatch: Dispatch<State>
}

interface S {
  macEntryMap: OrderedMap<string, boolean>
  ctid: number
  time: number
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

    // transform是否重置(大概等于当前楼层是否居中显示)
    transformReset: false,
  }

  onResetTransform = () => this.setState({ transformReset: true })

  onDeleteMacEntry = (mac: string) => {
    const { macEntryMap } = this.state
    const newMacEntryMap = macEntryMap.delete(mac)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))
  }

  onAddMacEntry = (mac: string) => {
    const { macEntryMap } = this.state
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
      // TODO 这里目前以rawTrack为准
      const { floorId, rawTracks } = this.props
      const nextTrack = rawTracks.find(track => (track.startTime <= time && time <= track.endTime))
      if (nextTrack && floorId !== nextTrack.floorId) {
        this.onChangeFloorId(nextTrack.floorId)
        this.setState({ time })
        this.onCentralizeTrack(nextTrack.trackId)
      } else {
        this.setState({ time })
      }
    }
  }

  onCentralizeTrack = (trackId: number) => this.setState({ ctid: trackId })

  onToggleMacEntry = (mac: string) => {
    const { macEntryMap } = this.state
    const not = (x: any) => !x
    const newMacEntryMap = macEntryMap.update(mac, not)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))
  }

  // 居中显示一个macName在当前楼层的第一个轨迹
  onCentralizeFirstTrack = (mac: string) => {
    // const { allTracks, floor } = this.props
    // const centralizedTrack = allTracks.find(tr => (tr.floorId === floor.floorId && tr.mac === mac))
    // if (centralizedTrack) {
    //   this.setState({ ctid: centralizedTrack.trackId })
    // }
  }

  onTrackMapZoom = () => {
    this.setState({ ctid: null, transformReset: false })
  }

  render() {
    const { rawTracks, semanticTracks, floorConfig, floor } = this.props
    const { time, ctid, macEntryMap, transformReset } = this.state

    // TODO 改成 showRawTracks / showSemanticTracks
    // const activeMacSet = macEntryMap.filter(Boolean).keySeq().toSet()

    const inThisFloor = (track: Track) => track.floorId === floor.floorId

    const visibleRawTracks = rawTracks.filter(inThisFloor)
    const visibleSemanticTracks = semanticTracks.filter(inThisFloor)

    const floorEntryList = fromJS(floorConfig).map((entry: Map<string, number | string>) => (
      entry.set('pointsCount', 0)
    )) as Map<string, number | string>

    return (
      <div>
        <div className="widgets">
          <ButtonGroup onResetTransform={this.onResetTransform} />
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
          rawTracks={visibleRawTracks}
          semanticTracks={visibleSemanticTracks}
          ctid={ctid}
          transformReset={transformReset}
          onChangeTime={this.onChangeTime}
          humanize={_.identity}
          onZoom={this.onTrackMapZoom}
        />
        <TimelinePanel
          time={time}
          onChangeTime={this.onChangeTime}
          rawTracks={rawTracks}
          semanticTracks={semanticTracks}
          // onCentralizeTrack={this.onCentralizeTrack}
        />
      </div>
    )
  }
}

export default bindSearchParameters(searchBindingDefinitions)(connect(mapStateToProps)(TrackMapPage))
