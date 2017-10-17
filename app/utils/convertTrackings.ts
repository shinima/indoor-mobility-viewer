import { CXTracking } from './TestDatInterface'

let nextTrackId = 1
let nextTrackPointId = 1

export default function convertTrackings(cxTrackings: CXTracking[]): Track[] {
  const result: Track[] = []
  for (const { trackPoints, mac } of cxTrackings) {
    let track: Track = null
    for (let i = 0; i < trackPoints.length; i++) {
      const p = trackPoints[i]
      if (i > 0 && trackPoints[i].floorId !== trackPoints[i - 1].floorId) {
        track.endTime = trackPoints[i - 1].leaveTime
        result.push(track)
        track = null
      }
      if (track == null) {
        track = {
          floorId: p.floorId,
          trackId: nextTrackId++,
          mac: mac,
          startTime: p.enterTime,
          endTime: 0, // endTime is calculated when track is pushed into result
          points: []
        }
      }
      track.points.push({
        trackPointId: nextTrackPointId++,
        mac: mac,
        pointType: 'normal',
        time: p.enterTime,
        duration: p.leaveTime - p.enterTime,
        floorId: p.floorId,
        x: p.x,
        y: p.y,
      })
    }
    if (track) {
      result.push(track)
    }
  }
  return result
}
