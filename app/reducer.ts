import * as _ from 'lodash'
import { combineReducers } from 'redux'
import { Map, OrderedMap } from 'immutable'
import floors, { Floor, floorConfig } from './resources/floors'
import cluster from './components/Map/cluster'
import * as A from './actionTypes'

const allItems: Location[] = require('./resources/items.json')

declare global {
  namespace S {
    interface State {
      allTracks: Track[]
      floors: Floor[]
      settings: Settings
    }

    interface Settings {
      floorConfig: {
        floorId: number
        floorName: string
      }[]
      staticMacItems: StaticMacItems
    }

    // todo
    // id -> OrderedMap<{ id:number, name: string, mac: string }>
    type StaticMacItems = OrderedMap<number, Map<any, any>>

    interface Action {
      [key: string]: any
    }
  }
}

function staticMacItems(state: S.StaticMacItems = null, action: S.Action) {
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

export default combineReducers<S.State>({
  // todo 动态的数据应该从后端获取
  allTracks: () => Map(_.groupBy(allItems, item => item.mac))
    .toList()
    .flatMap<number, Track>(cluster)
    .toArray(),
  floors: () => floors,
  settings: combineReducers<S.Settings>({
    floorConfig: () => floorConfig,
    // staticMacMapping: () => staticMacMapping,
    staticMacItems,
  }),
})
