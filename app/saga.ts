import * as rpc from './utils/rpc'
import { List } from 'immutable'
import { put, takeEvery } from 'redux-saga/effects'

export default function rootSaga() {
  // console.log('root saga start')
  // yield takeEvery('FETCH_LOCATION_ITEMS', fetchLocationItems)
}

// function compare(a: LocationItem, b: LocationItem) {
//   return a.time - b.time
// }

// function* fetchLocationItems({ date, macList }: Action.FetchLocationItems) {
//   try {
//     const { ok, data }: { ok: boolean, data?: LocationItem[] } = yield rpc.getLocationsByMac(date, macList)
//     if (ok) {
//       yield put<Action>({
//         type: 'UPDATE_LOCATION_ITEMS',
//         data: data.sort(compare),
//       })
//     }
//   } catch (error) {
//     console.log(error)
//   }
// }
