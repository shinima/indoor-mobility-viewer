declare module 'd3-selection' {
  interface Selection<GElement extends BaseType=Element, Datum=null, PElement extends BaseType = null, PDatum=null> {
  }
}

export type TrackName = 'raw' | 'semantic' | 'groundTruth'
export type TrackPointType = 'track-start' | 'normal' | 'track-end' | 'raw'

export interface TrackPoint {
  trackPointId: number
  trackName: TrackName
  pointType: TrackPointType
  time: number
  duration: number
  floorId: number
  x: number
  y: number
  roomID: number
  event: 'stay' | 'pass-by' | 'plain'
}

export interface Track {
  floorId: number
  trackId: number
  trackName: TrackName
  startTime: number
  endTime: number
  points: TrackPoint[]
}

export interface Point {
  x: number
  y: number
}

export interface Line {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface Range {
  start: number
  end: number
}
