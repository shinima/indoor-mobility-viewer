import * as _ from 'lodash'
import { combineReducers } from 'redux'
import { OrderedMap, Record } from 'immutable'
import floors, { floorConfig } from './resources/floors'

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

function allTracks(state: Track[] = [], action: Action) {
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
