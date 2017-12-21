import { Track, Range, TrackPoint } from '../../interfaces'
import { PlainTrackMap } from '../../reducer'

export function isSameTracks(ts1: Track[], ts2: Track[]) {
  if (ts1.length !== ts2.length) {
    return false
  }
  for (let index = 0; index < ts1.length; index += 1) {
    if (ts1[index].trackId !== ts2[index].trackId) {
      return false
    }
    const points1 = ts1[index].points
    const points2 = ts2[index].points
    const lastPoint1 = points1[points1.length - 1]
    const lastPoint2 = points2[points2.length - 1]
    if (lastPoint1.trackPointId !== lastPoint2.trackPointId) {
      return false
    }
  }
  return true
}

export function getTimeRange(trackPoints: TrackPoint[], sid: number): Range {
  const point = trackPoints.find(p => p.trackPointId === sid)
  if (point) {
    return { start: point.time, end: point.time + point.duration }
  } else {
    return { start: -1, end: -1 }
  }
}

export function isSamePlainTrackMap(m1: PlainTrackMap, m2: PlainTrackMap) {
  return isSameTracks(m1.raw, m2.raw)
    && isSameTracks(m1['cleaned-raw'], m2['cleaned-raw'])
    && isSameTracks(m1['ground-truth'], m2['ground-truth'])
}
