import { MomentInput } from 'moment'

export const DELETE_MAC_ITEM = 'DELETE_MAC_ITEM'
export const EDIT_MAC_ITEM = 'EDIT_MAC_ITEM'
export const ADD_MAC_ITEM = 'ADD_MAC_ITEM'
export const UPDATE_MAC_ITEMS = 'UPDATE_MAC_ITEMS'

export const UPDATE_LOCATION_ITEMS = 'UPDATE_LOCATION_ITEMS'

export const FETCH_LOCATION_ITEMS = 'FETCH_LOCATIONS_ITEMS'

declare global {
  interface FetchLocationItemsAction {
    type: 'FETCH_LOCATION_ITEMS'
    date: MomentInput
    mac: string
  }
}
