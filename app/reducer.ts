import { combineReducers } from 'redux'
import floors, { floorConfig } from './resources/floors'
import getTracks from './utils/data-source'
import { Track } from './interfaces'

// export type Action = UpdateTracks
//
// export interface UpdateTracks {
//   type: 'UPDATE_TRACKS'
//   tracks: Track[]
// }

export interface PlainTrackMap {
  raw: Track[]
  'cleaned-raw': Track[]
  'ground-truth': Track[]
}

export interface State {
  plainTrackMap: PlainTrackMap
  semanticTracks: Track[]
  floors: Floor[]
  floorConfig: FloorConfig
}

export type FloorConfig = {
  floorId: number
  floorName: string
}[]

const defaultSemanticTracks = getTracks('semantic')
const defaultPlainTrackMap = {
  raw: getTracks('raw'),
  'cleaned-raw': getTracks('cleaned-raw'),
  'ground-truth': getTracks('ground-truth'),
}

export default combineReducers<State>({
  plainTrackMap: () => defaultPlainTrackMap,
  semanticTracks: () => defaultSemanticTracks,
  floors: () => floors,
  floorConfig: () => floorConfig,
})
