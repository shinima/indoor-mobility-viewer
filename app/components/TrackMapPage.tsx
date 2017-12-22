import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import { Dispatch } from 'redux'
import TrackMap from '../components/Map/TrackMap'
import FloorList, { FloorEntryRecord } from '../components/FloorList'
import ButtonGroup from '../components/ButtonGroup'
import bindSearchParameters, { SearchParamBinding } from '../utils/bindSearchParameters'
import Legend from './Legend'
import { FloorConfig, PlainTrackMap, State } from '../reducer'
import TimelinePanel from './TimelinePanel'
import { Track, TrackPoint } from '../interfaces'
import { getTrackPoints } from '../utils/utils'
import { getTimeRange } from './Map/utils'
import '../styles/TrackMapPage.styl'

interface Def {
  floorId: number
  t: number
}

function mapStateToProps({ plainTrackMap, semanticTracks, floors, floorConfig }: State, ownProps: Def) {
  const { floorId } = ownProps
  const floor = floors.find(flr => flr.floorId === floorId) || floors[0]

  return Object.assign({ plainTrackMap, semanticTracks, floors, floorConfig, floor }, ownProps)
}

const searchBindingDefinitions = [
  { key: 'floorId', getter: Number, default: null as number },
  { key: 'htid', getter: Number, default: null },
]

type P = SearchParamBinding<Def> & {
  plainTrackMap: PlainTrackMap
  semanticTracks: Track[]
  floors: Floor[]
  floorConfig: FloorConfig
  floor: Floor
  dispatch: Dispatch<State>
}

interface S {
  showGroundTruthTrack: boolean
  showRawTrack: boolean
  showCleanedRawTrack: boolean
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
    showGroundTruthTrack: true,
    showRawTrack: false,
    showCleanedRawTrack: false,
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
    const { plainTrackMap, semanticTracks, floorConfig, floor } = this.props
    const { sid, transformReset, showRawTrack, showSemanticTrack, showCleanedRawTrack, showGroundTruthTrack } = this.state

    const inThisFloor = (track: Track) => track.floorId === floor.floorId
    const notInThisFloor = (trackPoint: TrackPoint) => trackPoint.floorId !== floor.floorId

    const visibleSemanticTracks = showSemanticTrack ? semanticTracks.filter(inThisFloor) : []

    const floorEntryList = List(floorConfig).map(flr => FloorEntryRecord({
      floorName: flr.floorName,
      floorId: flr.floorId,
      count: getFloorEntryCount(plainTrackMap.raw, flr.floorId),
    }))

    const semanticTrackPoints = getTrackPoints(semanticTracks)
    const range = getTimeRange(semanticTrackPoints, sid)
    const inThisTimeRange = (p: TrackPoint) => (range.start <= p.time && p.time <= range.end)

    const visiblePlainTrackMap: PlainTrackMap = {
      'ground-truth': showGroundTruthTrack ? plainTrackMap['ground-truth'].filter(inThisFloor) : [],
      raw: showRawTrack ? plainTrackMap.raw.filter(inThisFloor) : [],
      'cleaned-raw': showCleanedRawTrack ? plainTrackMap['cleaned-raw'].filter(inThisFloor) : [],
    }

    const extraTrackPoints = showRawTrack
      ? getTrackPoints(plainTrackMap.raw).filter(inThisTimeRange).filter(notInThisFloor)
      : []

    return (
      <div>
        <div className="floor-display">Floor: {floor.floorNumber}</div>
        <div className="widgets">
          <ButtonGroup onResetTransform={this.onResetTransform} />
          <Legend
            showGroundTruthTrack={showGroundTruthTrack}
            showRawTrack={showRawTrack}
            showCleanedRawTrack={showCleanedRawTrack}
            showSemanticTrack={showSemanticTrack}
            onToggleShowGroundTruthTrack={() => this.setState({ showGroundTruthTrack: !showGroundTruthTrack })}
            onToggleShowRawTrack={() => this.setState({ showRawTrack: !showRawTrack })}
            onToggleShowCleanedRawTrack={() => this.setState({ showCleanedRawTrack: !showCleanedRawTrack })}
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
          range={range}
          plainTrackMap={visiblePlainTrackMap}
          semanticTracks={visibleSemanticTracks}
          extraTrackPoints={extraTrackPoints}
          transformReset={transformReset}
          onChangeSid={this.onChangeSid}
          onZoom={this.onTrackMapZoom}
        />
        <TimelinePanel
          sid={sid}
          onChangeSid={this.onChangeSid}
          semanticTracks={semanticTracks}
        />
      </div>
    )
  }
}

export default bindSearchParameters(searchBindingDefinitions)(connect(mapStateToProps)(TrackMapPage))
