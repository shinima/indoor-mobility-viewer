import { MomentInput } from 'moment'
import { OrderedMap, Map } from 'immutable'
import { MacItemRecord } from './reducer'

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

    export type FetchMacItemsAction = {
      type: 'FETCH_MAC_ITEMS',
    }

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
      type: 'FETCH_LOCATION_ITEMS',
      date: MomentInput,
      // todo macList的类型不知道怎么定
      macList: any,
    }
  }
}
