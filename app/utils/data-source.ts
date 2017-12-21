import { Point, Track, TrackName } from '../interfaces'
import { Map } from 'immutable'
import floors from '../resources/floors'
import { avg } from './utils'

export interface LHData {
  groundTruthTraces: LHRawTrace[]
  rawTraces: LHRawTrace[]
  cleanedRawTraces: LHRawTrace[]
  semanticTraces: LHSemanticTrace[]
  startTime: number
  // objectID: number // 这个字段看起来没什么用
}

export interface LHSemanticTrace {
  data: {
    startTime: number
    endTime: number
    event: 'pass-by' | 'stay'
    roomID: number
    regionName: string
  }[]
  floor: number
}

export interface LHRawTrace {
  floor: string
  data: {
    x: number
    y: number
    time: number
  }[]
}

const floorByFloorId = Map<number, Floor>(floors.map(flr => [flr.floorId, flr] as [number, Floor]))

function getXY(floorId: number, roomId: number) {
  const floor = floorByFloorId.get(floorId)
  const { points } = floor.regions.find(r => (r.id === roomId))

  return {
    x: avg(points.map(p => p.x)),
    y: avg(points.map(p => p.y)),
  }
}

let nextTrackId = 1
let nextTrackPointId = 1

const lhData: LHData = require('../resources/test.json')

export default function getTracks(trackName: TrackName): Track[] {
  if (trackName === 'ground-truth') {
    return getRawTracks(lhData, lhData.groundTruthTraces, 'ground-truth')
  } else if (trackName === 'raw') {
    return getRawTracks(lhData, lhData.rawTraces, 'raw')
  } else if (trackName === 'cleaned-raw') {
    return getRawTracks(lhData, lhData.cleanedRawTraces, 'cleaned-raw')
  } else {
    return getSemanticTracks(lhData, lhData.semanticTraces, getXY)
  }
}

function getRawTracks(lhData: LHData, source: LHRawTrace[], trackName: TrackName): Track[] {
  const result: Track[] = []

  for (const { data, floor } of source) {
    const track: Track = {
      floorId: Number(floor),
      trackId: nextTrackId++,
      trackName,
      startTime: (lhData.startTime + data[0].time) * 1000,
      endTime: (lhData.startTime + data[data.length - 1].time) * 1000,
      points: [],
    }

    for (const { x, y, time } of data) {
      track.points.push({
        trackPointId: nextTrackPointId++,
        trackName,
        pointType: 'raw',
        time: (lhData.startTime + time) * 1000,
        duration: 0,
        floorId: Number(floor),
        x,
        y,
        event: 'plain',
        roomID: 0,
      })
    }

    result.push(track)
  }

  return result
}

function getSemanticTracks(
  lhData: LHData,
  source: LHSemanticTrace[],
  getXY: (floorId: number, roomId: Number) => Point,
): Track[] {
  const result: Track[] = []

  for (const { data, floor } of source) {
    const floorId = Number(floor)
    const track: Track = {
      floorId,
      trackId: nextTrackId++,
      trackName: 'semantic',
      startTime: (lhData.startTime + data[0].startTime) * 1000,
      endTime: (lhData.startTime + data[data.length - 1].endTime) * 1000,
      points: [],
    }

    for (const { roomID, startTime, endTime, event, regionName } of data) {
      track.points.push({
        trackPointId: nextTrackPointId++,
        trackName: 'semantic',
        pointType: event,
        time: (lhData.startTime + startTime) * 1000,
        duration: (endTime - startTime) * 1000,
        floorId,
        ...getXY(floorId, roomID),
        roomID,
        event,
        regionName,
      })
    }
    result.push(track)
  }

  return result
}
