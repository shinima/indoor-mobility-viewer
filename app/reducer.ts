import { combineReducers } from 'redux'
import { Map } from 'immutable'
import floors, { floorConfig } from './resources/floors'
import { getRawTracks, getSemanticTracks } from './utils/lh'
import { avg } from './utils/utils'

// export type Action = UpdateTracks
//
// export interface UpdateTracks {
//   type: 'UPDATE_TRACKS'
//   tracks: Track[]
// }

export interface State {
  rawTracks: Track[]
  semanticTracks: Track[]
  floors: Floor[]
  floorConfig: FloorConfig
}

export type FloorConfig = {
  floorId: number
  floorName: string
}[]

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

export default combineReducers<State>({
  rawTracks: () => defaultRawTracks,
  semanticTracks: () => defaultSemanticTracks,
  floors: () => floors,
  floorConfig: () => floorConfig,
})
