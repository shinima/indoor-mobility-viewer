import { MomentInput } from 'moment'
import { OrderedMap, Map } from 'immutable'
import { MacItemRecord } from './reducer'

// export const DELETE_MAC_ITEM = 'DELETE_MAC_ITEM'
// export const EDIT_MAC_ITEM = 'EDIT_MAC_ITEM'
// export const ADD_MAC_ITEM = 'ADD_MAC_ITEM'
// export const UPDATE_MAC_ITEMS = 'UPDATE_MAC_ITEMS'

// export const UPDATE_LOCATION_ITEMS = 'UPDATE_LOCATION_ITEMS'
//
// export const FETCH_LOCATION_ITEMS = 'FETCH_LOCATIONS_ITEMS'

// declare global {
//   interface FetchLocationItemsAction {
//     type: 'FETCH_LOCATION_ITEMS'
//     date: MomentInput
//     mac: string
//   }
// }

declare global {
  type Action = Action.Action
  type ActionType = Action.ActionType

  namespace Action {
    export type Action =
      UpdateMacItemsAction
      | EditMacItemAction
      | AddMacItemAction
      | DeleteMacItemAction
      | UpdateLocationItemsAction | FetchLocationItemsAction

    export type ActionType = Action['type']

    export type UpdateMacItemsAction = {
      type: 'UPDATE_MAC_ITEMS',
      staticMacItems: S.StaticMacItems,
    }

    export type EditMacItemAction = {
      type: 'EDIT_MAC_ITEM',
      id: number,
      macItem: MacItemRecord,
    }

    export type AddMacItemAction = {
      type: 'ADD_MAC_ITEM',
      id: number,
      name: string,
      mac: string,
    }

    export type DeleteMacItemAction = {
      type: 'DELETE_MAC_ITEM',
      id: number,
    }

    export type UpdateLocationItemsAction = {
      type: 'UPDATE_LOCATION_ITEMS',
      data: LocationItem[],
    }

    export type FetchLocationItemsAction = {
      type: 'FETCH_LOCATION_ITEMS'
      date: MomentInput
      mac: string
    }
  }
}
