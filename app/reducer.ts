import * as _ from 'lodash'
import { combineReducers } from 'redux'
import { Map, OrderedMap } from 'immutable'
import floors, { floorConfig } from './resources/floors'
import cluster from './components/Map/cluster'
import * as A from './actionTypes'
import { getLocations } from './utils/rpc'
import store from './store'

// const allItems: Location[] = require('./resources/items.json')
// console.log(getLocations('2017-06-22T00:00:00', '2017-06-22T00:03:00', [31, 32]))

declare global {
  namespace S {
    interface State {
      allItems: LocationItem[]
      allTracks: Track[]
      floors: Floor[]
      settings: Settings
    }

    interface Settings {
      floorConfig: FloorConfig
      staticMacItems: StaticMacItems
    }

    // todo
    // id -> OrderedMap<{ id:number, name: string, mac: string }>
    type StaticMacItems = OrderedMap<number, Map<any, any>>

    type FloorConfig = {
      floorId: number
      floorName: string
    }[]

    interface Action {
      [key: string]: any
    }
  }
}

function staticMacItems(state: S.StaticMacItems = OrderedMap(), action: S.Action) {
  if (action.type === A.EDIT_MAC_ITEM) {
    return state.mergeIn([action.id], action.macItem)
  } else if (action.type === A.DELETE_MAC_ITEM) {
    return state.delete(action.id)
  } else if (action.type === A.ADD_MAC_ITEM) {
    const { name, mac, id } = action
    return state.set(id, Map({ name, mac, id }))
    // return state.set(name, mac) todo
  } else if (action.type === A.UPDATE_MAC_ITEMS) {
    return action.data
  } else {
    return state
  }
}

function allItems(state: LocationItem[] = [], action: S.Action) {
  if (action.type === A.UPDATE_LOCATION_ITEMS) {
    return action.data
  } else {
    return state
  }
}

function allTracks(state: Track[] = [], action: S.Action) {
  if (action.type === A.UPDATE_LOCATION_ITEMS) {
    return Map(_.groupBy(action.data, (item: any) => item.mac))
      .toList()
      .flatMap<number, Track>(cluster)
      .toArray()
  } else {
    return state
  }
}

export default combineReducers<S.State>({
  // todo 动态的数据应该从后端获取
  allItems,
  allTracks,
  floors: () => floors,
  settings: combineReducers<S.Settings>({
    floorConfig: () => floorConfig,
    // staticMacMapping: () => staticMacMapping,
    staticMacItems,
  }),
})
