export enum PointType {
  STAY = 0,
  PASS = 1,
  LEAVE = 2,
  ENTER = 3,
  MISS = 4,
}

export interface TrackPoint {
  floorId: number
  x: number
  y: number
  enterTime: number
  leaveTime: number
  pointType: PointType
}

export interface CXTracking {
  mac: string
  trackPoints: TrackPoint[]
}

export interface CXLocation {
  id: number
  mac: string
  floorId: number
  time: number
  x: number
  y: number
}

export interface CXData {
  trackings: CXTracking[]
  locations: CXLocation[]
}
