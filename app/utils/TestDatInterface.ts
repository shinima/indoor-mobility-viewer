export enum PointType {
  STAY = 0,
  PASS = 1,
  LEAVE = 2,
  ENTER = 3,
  MISS = 4,
}

export interface CXTrackPointMember {
  id: number
  x: number
  y: number
}

export interface CXTrackPoint {
  floorId: number
  x: number
  y: number
  enterTime: number
  leaveTime: number
  pointType: PointType
  members: CXTrackPointMember[]
}

export interface CXTracking {
  mac: string
  trackPoints: CXTrackPoint[]
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
