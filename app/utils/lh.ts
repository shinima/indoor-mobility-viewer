export interface LHData {
  semanticTraces: LHSemanticTrace[]
  rawTraces: LHRawTrace[]
  startTime: number
  // objectID: number // 这个字段看起来没什么用
}

export interface LHSemanticTrace {
  data: {
    startTime: number
    endTime: number
    event: 'pass-by' | 'stay'
    roomID: number
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

let nextTrackId = 1
let nextTrackPointId = 1
const MAC = {
  raw: 'raw',
  semantics: 'semantics',
}

export function getRawTracks(lhData: LHData): Track[] {
  const result: Track[] = []

  for (const { data, floor } of lhData.rawTraces) {
    const track: Track = {
      floorId: Number(floor),
      trackId: nextTrackId++,
      mac: MAC.raw,
      startTime: (lhData.startTime + data[0].time) * 1000,
      endTime: (lhData.startTime + data[data.length - 1].time) * 1000,
      points: [],
    }

    for (const { x, y, time } of data) {
      track.points.push({
        trackPointId: nextTrackPointId++,
        mac: MAC.raw,
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

export function getSemanticTracks(
  lhData: LHData,
  getXY: (floorId: number, roomId: Number) => Point,
): Track[] {
  const result: Track[] = []

  for (const { data, floor } of lhData.semanticTraces) {
    const floorId = Number(floor)
    const track: Track = {
      floorId,
      trackId: nextTrackId++,
      mac: MAC.semantics,
      startTime: (lhData.startTime + data[0].startTime) * 1000,
      endTime: (lhData.startTime + data[data.length - 1].endTime) * 1000,
      points: [],
    }

    for (const { roomID, startTime, endTime } of data) {
      track.points.push({
        trackPointId: nextTrackPointId++,
        mac: MAC.semantics,
        pointType: 'normal',
        time: (lhData.startTime + startTime) * 1000,
        duration: (endTime - startTime) * 1000,
        floorId,
        ...getXY(floorId, roomID),
        members: [],
      })
    }
    track.points[0].pointType = 'track-start'
    track.points[track.points.length - 1].pointType = 'track-end'
    result.push(track)
  }

  return result
}