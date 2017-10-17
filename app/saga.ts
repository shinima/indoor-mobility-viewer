import * as rpc from './utils/rpc'
import { List } from 'immutable'
import { put, takeEvery } from 'redux-saga/effects'
import { MacItemRecord } from './reducer'

export default function* rootSaga() {
  console.log('root saga start')
  yield takeEvery('FETCH_LOCATION_ITEMS', fetchLocationItems)
  yield takeEvery('FETCH_REALTIME_LOCATION_ITEMS', fetchRealTimeLocationItems)
}

function compare(a: LocationItem, b: LocationItem) {
  return a.time - b.time
}

function* fetchLocationItems({ date, macList }: Action.FetchLocationItemsAction) {
  try {
    const { ok, data }: { ok: boolean, data?: LocationItem[] } = yield rpc.getLocationsByMac(date, macList)
    if (ok) {
      yield put<Action>({
        type: 'UPDATE_LOCATION_ITEMS',
        data: data.sort(compare),
      })
    }
  } catch (error) {
    console.log(error)
  }
}

function* fetchRealTimeLocationItems({ date, macList }: Action.FetchRealTimeLocationItemsAction) {
  try {
    const { ok, data }: { ok: boolean, data?: LocationItem[] }
      = yield rpc.getRealTimeLocationsByMac(date, macList)
    if (ok) {
      yield put<Action>({
        type: 'UPDATE_LOCATION_ITEMS',
        data: data.sort(compare),
      })
    }
  } catch (error) {
    console.log(error)
  }
}

