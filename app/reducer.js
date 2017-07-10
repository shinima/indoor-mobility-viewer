import _ from 'lodash'
import { combineReducers } from 'redux'
import { fromJS, Map } from 'immutable'
import allItems from './resources/items.json'
import staticMacMapping from './resources/static-mac-mapping.json'
import floors, { floorConfig } from './resources/floors'
import cluster from './components/Map/cluster'
import * as A from './actionTypes'

const initStaticMacItems = fromJS(staticMacMapping)
  .map((entry, index) => entry.set('id', index + 1))
  .toOrderedMap()
  .mapKeys((__, entry) => entry.get('id'))

function staticMacItems(state = initStaticMacItems, action) {
  if (action.type === A.EDIT_MAC_ITEM) {
    return state.mergeIn([action.id], action.macItem)
  } else if (action.type === A.DELETE_MAC_ITEM) {
    return state.delete(action.id)
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
