import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import { Dispatch } from 'redux'
import TrackMap from '../components/Map/TrackMap'
import FloorList, { FloorEntryRecord } from '../components/FloorList'
import ButtonGroup from '../components/ButtonGroup'
import bindSearchParameters, { SearchParamBinding } from '../utils/bindSearchParameters'
import VisibilityChooser from './VisibilityChooser'
import { FloorConfig, State } from '../reducer'
import TimelinePanel from './TimelinePanel'
import '../styles/TrackMapPage.styl'
import { Track, TrackPoint } from '../interfaces'
import { getTrackPoints } from '../utils/utils'

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
  showRawTrack: boolean
  showSemanticTrack: boolean
  sid: number
  transformReset: boolean
}

function getFloorEntryCount(tracks: Track[], floorId: number) {
  const allPoints = tracks.reduce<TrackPoint[]>((result, tr) => result.concat(tr.points), [])
  return allPoints.filter(p => p.floorId === floorId).length
}

class TrackMapPage extends React.Component<P, S> {
  state = {
    showRawTrack: true,
    showSemanticTrack: true,
    // 轨迹图和Timeline共享的senmantic-track-id
    sid: -1 as number,
    // transform是否重置(大概等于当前楼层是否居中显示)
    transformReset: false,
  }

  onResetTransform = () => this.setState({ transformReset: true })

  onChangeFloorId = (floorId: number) => {
    this.props.updateSearch({ floorId })
  }

  onChangeSid = (sid: number) => {
    const { floorId, semanticTracks } = this.props
    const point = getTrackPoints(semanticTracks).find(p => p.trackPointId === sid)
    this.setState({ sid })
    if (floorId !== point.floorId) {
      this.onChangeFloorId(point.floorId)
    }
  }

  onTrackMapZoom = () => {
    this.setState({ transformReset: false })
  }

  render() {
    const { rawTracks, semanticTracks, floorConfig, floor } = this.props
    const { sid, transformReset, showRawTrack, showSemanticTrack } = this.state

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
            showRawTrack={showRawTrack}
            showSemanticTrack={showSemanticTrack}
            onToggleShowRawTrack={() => this.setState({ showRawTrack: !showRawTrack })}
            onToggleShowSemanticTrack={() => this.setState({ showSemanticTrack: !showSemanticTrack })}
          />
          <FloorList
            selectedFloorId={floor.floorId}
            floorEntryList={floorEntryList}
            changeSelectedFloorId={this.onChangeFloorId}
          />
        </div>
        <TrackMap
          floor={floor}
          sid={sid}
          rawTracks={visibleRawTracks}
          semanticTracks={visibleSemanticTracks}
          transformReset={transformReset}
          onChangeSid={this.onChangeSid}
          onZoom={this.onTrackMapZoom}
        />
        <TimelinePanel
          sid={sid}
          onChangeSid={this.onChangeSid}
          rawTracks={rawTracks}
          semanticTracks={semanticTracks}
        />
      </div>
    )
  }
}

export default bindSearchParameters(searchBindingDefinitions)(connect(mapStateToProps)(TrackMapPage))
