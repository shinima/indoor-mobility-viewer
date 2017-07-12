import _ from 'lodash'
import { combineReducers } from 'redux'
import { fromJS, Map, OrderedMap } from 'immutable'
import allItems from './resources/items.json'
import staticMacMapping from './resources/static-mac-mapping.json'
import floors, { floorConfig } from './resources/floors'
import cluster from './components/Map/cluster'
import * as A from './actionTypes'

const initStaticMacItems = fromJS(staticMacMapping)
  .map((entry, index) => entry.set('id', index + 1))
  .toOrderedMap()
  .mapKeys((__, entry) => entry.get('id'))

function staticMacItems(state = OrderedMap(), action) {
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

export default combineReducers({
  // todo 动态的数据应该从后端获取
  allTracks: () => Map(_.groupBy(allItems, item => item.mac))
    .toList()
    .flatMap(cluster)
    .toArray(),
  floors: () => floors,
  settings: combineReducers({
    floorConfig: () => floorConfig,
    // staticMacMapping: () => staticMacMapping,
    staticMacItems,
  }),
})
