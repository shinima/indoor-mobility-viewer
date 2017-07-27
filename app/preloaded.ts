import * as moment from 'moment'
import * as Redux from 'redux'

moment.locale('zh-cn')

declare module 'd3-selection' {
  interface Selection<GElement extends BaseType=Element, Datum=null, PElement extends BaseType = null, PDatum=null> {
  }
}

declare global {
  type TrackPointType = 'track-start' | 'normal' | 'track-end'
  type Mac = string

  export type LocationItem = {
    id: number
    mac: string
    floorId: number
    x: number
    y: number
    time: number
  }

  interface TrackPoint {
    trackPointId: number
    mac: Mac
    pointType: TrackPointType
    time: number
    duration: number
    floorId: number
    x: number
    y: number
    // todo
  }

  interface Track {
    duration: number
    floorId: number
    trackId: number
    mac: string
    startTime: number
    endTime: number
    points: TrackPoint[]
  }

  interface Item {
    id: number
    x: number
    y: number
    time: number
    floorId: number
  }

  interface Point {
    x: number
    y: number
  }

  interface Line {
    x1: number
    y1: number
    x2: number
    y2: number
  }

  type HumanizeFn = (mac: string) => string
  type TranslateFn = (macMac: string) => Mac

  type Dispatch = Redux.Dispatch<S.State>
  type Store = Redux.Store<S.State>
}
