import { combineReducers } from 'redux'
import { Map } from 'immutable'
import floors, { floorConfig } from './resources/floors'
import { getRawTracks, getSemanticTracks, LHData } from './utils/lh'
import { avg } from './utils/utils'

export type Action = UpdateTracks

export interface UpdateTracks {
  type: 'UPDATE_TRACKS'
  tracks: Track[]
}

declare global {
  namespace S {
    interface State {
      allItems: LocationItem[]
      allTracks: Track[]
      floors: Floor[]
      floorConfig: FloorConfig
    }

    type FloorConfig = {
      floorId: number
      floorName: string
    }[]
  }
}

// console.log(floors)
const floorByFloorId = Map<number, Floor>(floors.map(flr => [flr.floorId, flr] as [number, Floor]))

function getXY(floorId: number, roomId: number) {
  const floor = floorByFloorId.get(floorId)
  const { points } = floor.regions.find(r => (r.id === roomId))

  return {
    x: avg(points.map(p => p.x)),
    y: avg(points.map(p => p.y)),
  }
}

const defaultRawTracks = getRawTracks(require('./resources/test.json'))
const defaultSemanticTracks = getSemanticTracks(require('./resources/test.json'), getXY)

// TODO 这个目前仅供测试
const defaultTracks = defaultRawTracks.concat(defaultSemanticTracks)

function allTracks(state: Track[] = defaultTracks, action: Action) {
  if (action.type === 'UPDATE_TRACKS') {
    return action.tracks
  } else {
    return state
  }
}

export default combineReducers<S.State>({
  allItems: () => [],
  allTracks,
  floors: () => floors,
  floorConfig: () => floorConfig,
})
