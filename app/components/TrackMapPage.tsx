import * as React from 'react'
import * as _ from 'lodash'
import * as moment from 'moment'
import { Moment } from 'moment'
import { connect } from 'react-redux'
import { fromJS, OrderedMap, Map } from 'immutable'
import { Dispatch } from 'redux'
import { History } from 'history'
import TrackMap from '../components/Map/TrackMap'
import TrackDetailPanel from '../components/TrackDetailPanel'
import FloorList from '../components/FloorList'
import ButtonGroup from '../components/ButtonGroup'
import Legend from '../components/Legend'
import bindSearchParameters, { SearchParamBinding } from '../utils/bindSearchParameters'
import { IComponent } from '../utils/utils'
import MacList from '../components/MacList'
import TimeChooser from './TimeChooser'
import '../styles/TrackMapPage.styl'
import * as rpc from '../utils/rpc'
import * as A from '../actionTypes'

const defaultDate = '2017-06-20'

type Def = {
  floorId: number
  htid: number
  date: Moment | string
  t: number
}

function mapStateToProps({ allTracks, floors, settings }: S.State, ownProps: Def) {
  const { floorConfig, staticMacItems } = settings
  // calculate floor from floors and floorId
  const { floorId } = ownProps
  const floor = floors.find(flr => flr.floorId === floorId) || floors[0]

  return Object.assign({ allTracks, floors, floorConfig, floor, staticMacItems }, ownProps)
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
  floors: Floor[]
  floorConfig: S.FloorConfig
  floor: Floor
  staticMacItems: S.StaticMacItems
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
  // todo 当日期发生变化的时候, 需要重新获取当天的数据
  // componentDidUpdate(nextProps) {
  //   if (typeof this.props.date === 'string' && )
  // }

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

  componentDidMount() {
    const { t } = this.props
    this.props.dispatch({ type: A.FETCH_LOCATION_ITEMS, date: moment(t), mac: 'dc:37:14:50:9d:01' })
  }

  componentDidUpdate(prevProps: P) {
    const { t } = this.props
    if (prevProps.t !== t) {
      this.props.dispatch({
        type: A.FETCH_LOCATION_ITEMS,
        date: moment(t),
        mac: 'dc:37:14:50:9d:01'
      })
    }

  }

  translate: TranslateFn = (macName) => {
    const { staticMacItems } = this.props
    const entry = staticMacItems.find(item => item.get('name') === macName)
    return entry ? entry.get('mac') : macName
  }

  humanize: HumanizeFn = (mac) => {
    const { staticMacItems } = this.props
    const entry = staticMacItems.find(item => item.get('mac') === mac)
    return entry ? entry.get('name') : mac
  }

  onDeleteMacEntry = (macName: string) => {
    const { allTracks, htid } = this.props
    const { macEntryMap } = this.state
    const newMacEntryMap = macEntryMap.delete(macName)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))

    // 如果当前高亮的轨迹正好要被删除, 那么将htid设置为null
    if (htid != null && macEntryMap.get(macName)) {
      const highlightedTrack = allTracks.find(tr => tr.trackId === htid)
      if (highlightedTrack.mac === this.translate(macName)) {
        this.props.updateSearch({ htid: null })
      }
    }
  }

  onAddMacEntry = (macName: string) => {
    const { macEntryMap } = this.state
    const newMacEntryMap = macEntryMap.set(macName, true)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))
  }

  onChangeFloorId = (floorId: number) => {
    this.props.updateSearch({ floorId })
  }

  onCentralizeTrack = (trackId: number) => {
    this.setState({ ctid: trackId, showPath: true })
  }

  onToggleMacEntry = (macName: string) => {
    const { allTracks } = this.props
    const { htid, macEntryMap } = this.state
    const not = (x: any) => !x
    const newMacEntryMap = macEntryMap.update(macName, not)
    this.setState({ macEntryMap: newMacEntryMap })
    localStorage.setItem('mac-list', JSON.stringify(newMacEntryMap))
    // 如果当前高亮的轨迹正好要设置为不可见, 那么将htid设置为null
    if (htid != null && macEntryMap.get(macName)) {
      const highlightedTrack = allTracks.find(tr => tr.trackId === htid)
      if (highlightedTrack.mac === this.translate(macName)) {
        this.setState({ htid: null })
      }
    }
  }

  // 高亮一个macName在当前楼层的第一条轨迹
  onHighlightFirstTrack = (macName: string) => {
    const { allTracks, floor } = this.props
    const mac = this.translate(macName)
    const { macEntryMap } = this.state
    const highlightedTrack = allTracks.find(tr => (tr.floorId === floor.floorId && tr.mac === mac))
    if (highlightedTrack) {
      this.setState({ macEntryMap: macEntryMap.set(macName, true) })
      this.props.updateSearch({ htid: highlightedTrack.trackId })
    }
    // todo else 没有找到轨迹的话, 需要使用toast来提示用户
  }

  // 居中显示一个macName在当前楼层的第一个轨迹
  onCentralizeFirstTrack = (macName: string) => {
    const { allTracks, floor } = this.props
    const mac = this.translate(macName)
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

  renderTrackDetailPanel() {
    const { allTracks, htid, floor } = this.props
    const { htpid } = this.state
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
    const { allTracks, floorConfig, floor, htid, history, t } = this.props
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
      .map(this.translate)
      .toSet()
    const visibleTracks = allTracks
      .filter(track => track.floorId === floor.floorId)
      .filter(track => activeMacSet.has(track.mac))

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
          <TimeChooser
            time={moment(t)}
            hasSlider={false}
            onChangeTime={m => this.props.updateSearch({ t: m.valueOf() }, true)}
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
            changeSelectedFloorId={this.onChangeFloorId}
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

export default bindSearchParameters(searchBindingDefinitions)(connect(mapStateToProps)(TrackMapPage))
