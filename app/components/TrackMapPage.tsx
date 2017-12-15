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
  htid: number
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

type S = {
  macEntryMap: OrderedMap<string, boolean>
  ctid: number
  htpid: number
  htid: number
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
    // highlighted-track-point-id
    htpid: null as number,
    htid: null as number,
    showPath: true,
    showPoints: true,
    // transform是否重置(大概等于当前楼层是否居中显示)
    transformReset: false,
  }

  onDeleteMacEntry = (mac: string) => {
    const { allTracks, htid } = this.props
    const { macEntryMap } = this.state
    const newMacEntryMap = macEntryMap.delete(mac)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))

    // 如果当前高亮的轨迹正好要被删除, 那么将htid设置为null
    if (htid != null && macEntryMap.get(mac)) {
      const highlightedTrack = allTracks.find(tr => tr.trackId === htid)
      if (highlightedTrack.mac === mac) {
        this.props.updateSearch({ htid: null })
      }
    }
  }

  onAddMacEntry = (mac: string) => {
    const { macEntryMap } = this.state
    const { t } = this.props
    const newMacEntryMap = macEntryMap.set(mac, true)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))

    const macList = macEntryMap.filter(checked => checked).keySeq().toArray()
    this.props.dispatch<Action>({
      type: 'FETCH_LOCATION_ITEMS',
      date: moment(t),
      macList: macList.concat([mac]),
    })
  }

  onChangeFloorId = (floorId: number) => {
    this.props.updateSearch({ floorId })
  }

  onCentralizeTrack = (trackId: number) => {
    this.setState({ ctid: trackId, showPath: true })
  }

  onToggleMacEntry = (mac: string) => {
    const { allTracks } = this.props
    const { htid, macEntryMap } = this.state
    const not = (x: any) => !x
    const newMacEntryMap = macEntryMap.update(mac, not)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))
    // 如果当前高亮的轨迹正好要设置为不可见, 那么将htid设置为null
    if (htid != null && macEntryMap.get(mac)) {
      const highlightedTrack = allTracks.find(tr => tr.trackId === htid)
      if (highlightedTrack.mac === mac) {
        this.setState({ htid: null })
      }
    }
  }

  // 高亮一个macName在当前楼层的第一条轨迹
  onHighlightFirstTrack = (mac: string) => {
    const { allTracks, floor } = this.props
    const { macEntryMap } = this.state
    const highlightedTrack = allTracks.find(tr => (tr.floorId === floor.floorId && tr.mac === mac))
    if (highlightedTrack) {
      this.setState({ macEntryMap: macEntryMap.set(mac, true) })
      this.props.updateSearch({ htid: highlightedTrack.trackId })
    }
    // todo else 没有找到轨迹的话, 需要使用toast来提示用户
  }

  // 居中显示一个macName在当前楼层的第一个轨迹
  onCentralizeFirstTrack = (mac: string) => {
    const { allTracks, floor } = this.props
    const centralizedTrack = allTracks.find(tr => (tr.floorId === floor.floorId && tr.mac === mac))
    if (centralizedTrack) {
      this.setState({ ctid: centralizedTrack.trackId })
    }
  }

  onChangeHtid = (htid: number) => {
    const { allTracks, floor, floors } = this.props
    const ht = allTracks.find(tr => tr.trackId === htid)
    // ht: highlighted-track
    if (ht && floor.floorId !== ht.floorId) {
      // todo 如果发生了楼层切换, 那么默认居中显示highlighted-track
      const nextFloor = floors.find(flr => flr.floorId === ht.floorId)
      this.setState({ ctid: htid })
      this.props.updateSearch({ htid, floorId: nextFloor.floorId })
    } else {
      this.props.updateSearch({ htid })
    }
  }

  onChangeHtpid = (htpid: number) => this.setState({ htpid })

  onChangeTime = (m: Moment) => {
    this.props.updateSearch({ t: m.valueOf(), htid: null }, true)
  }

  renderTrackDetailPanel() {
    const { allTracks, htid, floor } = this.props
    const { htpid } = this.state
    if (htid != null) {
      // ht: highlighted track
      const ht = allTracks.find(tr => tr.trackId === htid)
      if (ht) {
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
            humanize={_.identity}
          />
        )
      }
    }
    return null
  }

  render() {
    const { allTracks, allItems, floorConfig, floor, htid, history, t } = this.props
    const {
      ctid,
      htpid,
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
            onHighlightFirstTrack={this.onHighlightFirstTrack}
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
          floor={floor}
          tracks={visibleTracks}
          items={visibleItems}
          showPath={showPath}
          showPoints={showPoints}
          htid={htid}
          ctid={ctid}
          transformReset={transformReset}
          htpid={htpid}
          onChangeHtid={this.onChangeHtid}
          onChangeHtpid={this.onChangeHtpid}
          humanize={_.identity}
          onZoom={() => this.setState({ ctid: null, transformReset: false })}
        />
        {this.renderTrackDetailPanel()}
      </div>
    )
  }
}

export default bindSearchParameters(searchBindingDefinitions)(connect(mapStateToProps)(TrackMapPage))
