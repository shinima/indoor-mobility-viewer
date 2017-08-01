import * as _ from 'lodash'
import { combineReducers } from 'redux'
import { Map, OrderedMap, Record } from 'immutable'
import floors, { floorConfig } from './resources/floors'
import cluster from './components/Map/cluster'
import * as A from './actionTypes'

// const allItems: Location[] = require('./resources/items.json')
// console.log(getLocations('2017-06-22T00:00:00', '2017-06-22T00:03:00', [31, 32]))

export const MacItemRecord = Record({
  id: 0,
  name: '',
  mac: '',
})
const macItemRecord = MacItemRecord()
export type MacItemRecord = typeof macItemRecord

declare global {
  namespace S {
    interface State {
      // allItems: LocationItem[]
      allTracks: Track[]
      floors: Floor[]
      settings: Settings
    }

    interface Settings {
      floorConfig: FloorConfig
      staticMacItems: StaticMacItems
    }

    type StaticMacItems = OrderedMap<number, MacItemRecord>

    type FloorConfig = {
      floorId: number
      floorName: string
    }[]
  }
}

function staticMacItems(state: S.StaticMacItems = OrderedMap(), action: Action) {
  if (action.type === 'EDIT_MAC_ITEM') {
    return state.mergeIn([action.id], action.macItem)
  } else if (action.type === 'DELETE_MAC_ITEM') {
    return state.delete(action.id)
  } else if (action.type === 'ADD_MAC_ITEM') {
    const { name, mac, id } = action
    return state.set(id, MacItemRecord({ name, mac, id }))
  } else if (action.type === 'UPDATE_MAC_ITEMS') {
    return action.staticMacItems
  } else {
    return state
  }
}

// function allItems(state: LocationItem[] = [], action: S.Action) {
//   if (action.type === A.UPDATE_LOCATION_ITEMS) {
//     return action.data
//   } else {
//     return state
//   }
// }

function allTracks(state: Track[] = [], action: Action) {
  if (action.type === 'UPDATE_LOCATION_ITEMS') {
    return _.flatMap(_.groupBy(action.data, item => item.mac), cluster)
  } else {
    return state
  }
}

export default combineReducers<S.State>({
  // todo 动态的数据应该从后端获取
  // allItems,
  allTracks,
  floors: () => floors,
  settings: combineReducers<S.Settings>({
    floorConfig: () => floorConfig,
    // staticMacMapping: () => staticMacMapping,
    staticMacItems,
  }),
})
