import * as rpc from './utils/rpc'
import { List } from 'immutable'
import { put, takeEvery } from 'redux-saga/effects'
import { MacItemRecord } from './reducer'

export default function* rootSaga() {
  console.log('root saga start')
  yield takeEvery('FETCH_LOCATION_ITEMS', fetchLocationItems)
  yield takeEvery('FETCH_MAC_ITEMS', fetchMacItems)
}

function* fetchLocationItems({ date, macList }: Action.FetchLocationItemsAction) {
  try {
    const { ok, data }: { ok: boolean, data?: LocationItem[] } = yield rpc.getLocationsByMac(date, macList)
    if (ok) {
      yield put<Action>({
        type: 'UPDATE_LOCATION_ITEMS',
        data,
      })
    }
  } catch (error) {
    console.log(error)
  }
}

function* fetchMacItems() {
  try {
    const { ok, data } = yield rpc.getStaticMacMappings()
    if (ok) {
      const staticMacItems = List(data)
        .map(MacItemRecord)
        .toOrderedMap()
        .mapKeys((__, entry) => entry.get('id'))
      yield put<Action>({ type: 'UPDATE_MAC_ITEMS', staticMacItems })
    }
  } catch (error) {
    console.log(error)
  }
}

