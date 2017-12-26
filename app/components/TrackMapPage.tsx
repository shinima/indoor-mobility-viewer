import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import { Dispatch } from 'redux'
import TrackMap from '../components/Map/TrackMap'
import FloorList, { FloorEntryRecord } from '../components/FloorList'
import ButtonGroup from '../components/ButtonGroup'
import Legend from './Legend'
import { FloorConfig, PlainTrackMap, State } from '../reducer'
import TimelinePanel from './TimelinePanel'
import { Track, TrackPoint } from '../interfaces'
import { getTrackPoints, identity } from '../utils/utils'
import { getTimeRange } from './Map/utils'
import '../styles/TrackMapPage.styl'

interface P {
  plainTrackMap: PlainTrackMap
  semanticTracks: Track[]
  floors: Floor[]
  floorConfig: FloorConfig
  dispatch: Dispatch<State>
  filename: string
}

interface S {
  showGroundTruthTrack: boolean
  showRawTrack: boolean
  showCleanedRawTrack: boolean
  showSemanticTrack: boolean
  sid: number
  ctid: number
  floorId: number
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
    floorId: -1,
    // 轨迹图和Timeline共享的senmantic-track-id
    sid: -1,
    // centralized-track-id
    ctid: -1,
    // transform是否重置(大概等于当前楼层是否居中显示)
    transformReset: false,
  }

  onResetTransform = () => this.setState({ transformReset: true })

  onChangeFloorId = (floorId: number) => {
    this.setState({ floorId })
  }

  onChangeSid = (sid: number) => {
    const { semanticTracks } = this.props
    const { floorId } = this.state
    const point = getTrackPoints(semanticTracks).find(p => p.trackPointId === sid)
    if (floorId !== point.floorId) {
      this.onChangeFloorId(point.floorId)
      const track = semanticTracks.find(t => t.points.some(p => p.trackPointId === sid))
      this.setState({ sid, ctid: track.trackId })
    } else {
      this.setState({ sid })
    }
  }

  onTrackMapZoom = () => {
    this.setState({ transformReset: false })
  }

  getFloor() {
    const { floors } = this.props
    const { floorId } = this.state
    return floors.find(flr => flr.floorId === floorId) || floors[0]
  }

  render() {
    const { plainTrackMap, semanticTracks, floorConfig, filename } = this.props
    const { sid, ctid, transformReset, showRawTrack, showSemanticTrack, showCleanedRawTrack, showGroundTruthTrack } = this.state
    const floor = this.getFloor()

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
          <ButtonGroup onResetTransform={this.onResetTransform} filename={filename} />
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
          ctid={ctid}
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

export default connect(identity)(TrackMapPage)
