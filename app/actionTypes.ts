import { MomentInput } from 'moment'
import { OrderedMap, Map } from 'immutable'

declare global {
  type Action = Action.Action

  namespace Action {
    export type Action =
      | UpdateLocationItems
      | FetchLocationItems
      | UpdateTracks

    export interface UpdateLocationItems {
      type: 'UPDATE_LOCATION_ITEMS',
      locationItems: LocationItem[],
    }

    export interface UpdateTracks {
      type: 'UPDATE_TRACKS'
      tracks: Track[]
    }

    export interface FetchLocationItems {
      type: 'FETCH_LOCATION_ITEMS',
      date: MomentInput,
      macList: string[],
    }
  }
}
