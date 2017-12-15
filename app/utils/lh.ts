import { range } from 'lodash'

export interface LHData {
  // 'm-semantics': any // todo
  rawTrace: LHRawTrace[]
  startTime: number
  // objectID: number // 这个字段看起来没什么用
}

export interface LHRawTrace {
  floor: string
  data: {
    x: number
    y: number
    time: number
  }[]
}

let nextTrackId = 1
let nextTrackPointId = 1
const lhmac = 'raw'

export function getTracks(lhData: LHData): Track[] {
  const result: Track[] = []

  for (const { data, floor } of lhData.rawTrace) {
    const track: Track = {
      floorId: Number(floor),
      trackId: nextTrackId++,
      mac: lhmac,
      startTime: (lhData.startTime + data[0].time) * 1000,
      endTime: (lhData.startTime + data[data.length - 1].time) * 1000,
      points: [],
    }

    for (const { x, y, time } of data) {
      track.points.push({
        trackPointId: nextTrackPointId++,
        mac: lhmac,
        pointType: 'raw',
        time: (lhData.startTime + time) * 1000,
        duration: 0,
        floorId: Number(floor),
        x,
        y,
        members: [],
      })
    }

    result.push(track)
  }

  return result
}
