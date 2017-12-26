import floors, { floorConfig } from './resources/floors'
import getTracks, { LHData } from './utils/data-source'
import { Track } from './interfaces'

export type Action = ChangeDataSourceAction

export interface ChangeDataSourceAction {
  type: 'CHANGE_DATA_SOURCE'
  data: LHData
  filename: string
}

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
  filename: string
}

export type FloorConfig = {
  floorId: number
  floorName: string
}[]

const defaultData: LHData = require('./resources/test.json')

const defaultState = {
  plainTrackMap: {
    raw: getTracks(defaultData, 'raw'),
    'cleaned-raw': getTracks(defaultData, 'cleaned-raw'),
    'ground-truth': getTracks(defaultData, 'ground-truth'),
  },
  semanticTracks: getTracks(defaultData, 'semantic'),
  floors,
  floorConfig,
  filename: 'default',
}

export default function reducer(state: State = defaultState, action: Action): State {
  if (action.type === 'CHANGE_DATA_SOURCE') {
    const data = action.data
    return {
      ...state,
      plainTrackMap: {
        raw: getTracks(data, 'raw'),
        'cleaned-raw': getTracks(data, 'cleaned-raw'),
        'ground-truth': getTracks(data, 'ground-truth'),
      },
      semanticTracks: getTracks(data, 'semantic'),
      filename: action.filename,
    }
  } else {
    return state
  }
}
