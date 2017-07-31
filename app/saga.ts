import * as rpc from './utils/rpc'
import { put, takeEvery } from 'redux-saga/effects'
import * as A from './actionTypes'

export default function* rootSaga() {
  console.log('root saga start')
  yield takeEvery(A.FETCH_LOCATION_ITEMS, fetchLocationItems)
}

function* fetchLocationItems({ date, mac }: FetchLocationItemsAction) {
  try {
    const response = yield rpc.getLocationsByMac(date, mac)
    if (response.ok) {
      yield put({
        type: A.UPDATE_LOCATION_ITEMS,
        data: response.data
      })
    }
  } catch (error) {
    console.log(error)
  }
}
