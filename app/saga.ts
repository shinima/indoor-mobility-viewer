import * as rpc from './utils/rpc'
import { Map, List } from 'immutable'
import { put, takeEvery } from 'redux-saga/effects'
import * as A from './actionTypes'

export default function* rootSaga() {
  console.log('root saga start')
  yield takeEvery('FETCH_LOCATION_ITEMS', fetchLocationItems)
  yield takeEvery('FETCH_MAC_ITEMS', fetchMacItems)
}

function* fetchLocationItems({ date, macList }: Action.FetchLocationItemsAction) {
  try {
    const response = yield rpc.getLocationsByMac(date, macList)
    if (response.ok) {
      yield put<Action>({
        type: 'UPDATE_LOCATION_ITEMS',
        data: response.data
      })
    }
  } catch (error) {
    console.log(error)
  }
}

function* fetchMacItems(){
  try{
    const response = yield rpc.getStaticMacMappings()
    if (response.ok) {
      const data: any = List(response.mappings)
        .map(Map)
        .toOrderedMap()
        .mapKeys((__, entry) => entry.get('id'))
      yield put<Action>({ type: 'UPDATE_MAC_ITEMS', data })
    }
  } catch (error) {
    console.log(error)
  }
}

