import { combineReducers } from 'redux'
import floors, { floorConfig } from './resources/floors'
import { getTracks, LHData } from './utils/lh'

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

function allItems(state: LocationItem[] = [], action: Action) {
  if (action.type === 'UPDATE_LOCATION_ITEMS') {
    return action.locationItems
  } else {
    return state
  }
}

const defaultTracks = getTracks(require('./resources/test.json'))

function allTracks(state: Track[] = defaultTracks, action: Action) {
  if (action.type === 'UPDATE_TRACKS') {
    return action.tracks
  } else {
    return state
  }
}

export default combineReducers<S.State>({
  allItems,
  allTracks,
  floors: () => floors,
  floorConfig: () => floorConfig,
})
