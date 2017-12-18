import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import { Dispatch } from 'redux'
import TrackMap from '../components/Map/TrackMap'
import FloorList, { FloorEntryRecord } from '../components/FloorList'
import ButtonGroup from '../components/ButtonGroup'
import bindSearchParameters, { SearchParamBinding } from '../utils/bindSearchParameters'
import { IComponent } from '../utils/utils'
import VisibilityChooser from './VisibilityChooser'
import { FloorConfig, State } from '../reducer'
import TimelinePanel from './TimelinePanel'
import '../styles/TrackMapPage.styl'
import { Track, TrackName, TrackPoint } from '../interfaces'

interface Def {
  floorId: number
  t: number
}

function mapStateToProps({ rawTracks, semanticTracks, floors, floorConfig }: State, ownProps: Def) {
  const { floorId } = ownProps
  const floor = floors.find(flr => flr.floorId === floorId) || floors[0]

  return Object.assign({ rawTracks, semanticTracks, floors, floorConfig, floor }, ownProps)
}

const searchBindingDefinitions = [
  { key: 'floorId', getter: Number, default: null as number },
  { key: 'htid', getter: Number, default: null },
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
  baseTrackName: TrackName
  showRawTrack: boolean
  showSemanticTrack: boolean
  ctid: number
  time: number
  transformReset: boolean
}

function getFloorEntryCount(tracks: Track[], floorId: number) {
  const allPoints = tracks.reduce<TrackPoint[]>((result, tr) => result.concat(tr.points), [])
  return allPoints.filter(p => p.floorId === floorId).length
}

class TrackMapPage extends IComponent<P, S> {
  state = {
    baseTrackName: 'raw' as TrackName,
    showRawTrack: true,
    showSemanticTrack: true,
    // centralized-track-id
    ctid: null as number,

    // 时间线
    time: 0,

    // transform是否重置(大概等于当前楼层是否居中显示)
    transformReset: false,
  }

  onResetTransform = () => this.setState({ transformReset: true })

  onChangeFloorId = (floorId: number) => {
    this.props.updateSearch({ floorId })
  }

  onChangeTime = (time: number, nextBaseTrackName?: TrackName) => {
    if (time === 0) {
      this.setState({ time })
    } else {
      const { floorId, rawTracks, semanticTracks } = this.props
      const baseTrackName = nextBaseTrackName || this.state.baseTrackName
      const baseTracks = baseTrackName === 'raw' ? rawTracks : semanticTracks
      const nextTrack = baseTracks.find(track => (track.startTime <= time && time <= track.endTime))
      if (nextTrack && floorId !== nextTrack.floorId) {
        this.onChangeFloorId(nextTrack.floorId)
        this.setState({ time, ctid: nextTrack.trackId, baseTrackName })
      } else {
        this.setState({ time, baseTrackName })
      }
    }
  }

  onTrackMapZoom = () => {
    this.setState({ ctid: null, transformReset: false })
  }

  render() {
    const { rawTracks, semanticTracks, floorConfig, floor } = this.props
    const { time, ctid, transformReset, showRawTrack, showSemanticTrack, baseTrackName } = this.state

    const inThisFloor = (track: Track) => track.floorId === floor.floorId

    const visibleRawTracks = showRawTrack ? rawTracks.filter(inThisFloor) : []
    const visibleSemanticTracks = showSemanticTrack ? semanticTracks.filter(inThisFloor) : []

    const floorEntryList = List(floorConfig).map(flr => FloorEntryRecord({
      floorName: flr.floorName,
      floorId: flr.floorId,
      count: getFloorEntryCount(rawTracks, flr.floorId),
    }))

    return (
      <div>
        <div className="floor-display">Floor: {floor.floorNumber}</div>
        <div className="widgets">
          <ButtonGroup onResetTransform={this.onResetTransform} />
          <VisibilityChooser
            baseTrackName={baseTrackName}
            showRawTrack={showRawTrack}
            showSemanticTrack={showSemanticTrack}
            onToggleShowRawTrack={() => this.setState({ showRawTrack: !showRawTrack })}
            onToggleShowSemanticTrack={() => this.setState({ showSemanticTrack: !showSemanticTrack })}
            onChangeBaseTrackName={baseTrackName => this.setState({ baseTrackName })}
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
          onZoom={this.onTrackMapZoom}
        />
        <TimelinePanel
          time={time}
          onChangeTime={this.onChangeTime}
          rawTracks={rawTracks}
          semanticTracks={semanticTracks}
          baseTrackName={baseTrackName}
          // onCentralizeTrack={this.onCentralizeTrack}
        />
      </div>
    )
  }
}

export default bindSearchParameters(searchBindingDefinitions)(connect(mapStateToProps)(TrackMapPage))
