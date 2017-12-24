import { Track, TrackPoint } from '../interfaces'

/** 获取 key 对应的颜色 */
export function getColor(key: string) {
  if (key === 'ground-truth') {
    return '#444444'
  } else if (key === 'raw') {
    return '#3078b3'
  } else if (key === 'cleaned-raw') {
    return '#7fc378'
  } else if (key === 'semantic') {
    return '#ffa726'
  } else if (key === 'semantic-stay') {
    return '#fb8c00'
  } else {
    throw new Error(`Invalid key ${key}`)
  }
}

/** 计算数组平均值 */
export function avg(ns: number[]) {
  let sum = 0
  for (const n of ns) {
    sum += n
  }
  return sum / ns.length
}

/** 使用二分法来搜索最近的轨迹点。这里的最近指的是时间上的距离 */
export function getClosestTrackPointId(trackPoints: TrackPoint[], time: number) {
  time = Math.round(time)
  let top = 0
  let bottom = trackPoints.length - 1
  while (top <= bottom) {
    const middle = Math.floor((top + bottom) / 2)
    const mpoint = trackPoints[middle]
    const mstart = mpoint.time
    const mend = mpoint.time + mpoint.duration
    if (mstart <= time && time <= mend) {
      return mpoint.trackPointId
    }
    if (mend < time) {
      top = middle + 1
    } else if (mstart > time) {
      bottom = middle - 1
    }
  }
  return -1
  // const bp = trackPoints[bottom]
  // const tp = trackPoints[top]
  // if (bp && tp) {
  //   const distance1 = Math.abs(bp.time + bp.duration - time)
  //   const distance2 = Math.abs(tp.time - time)
  //   return distance1 < distance2 ? bp.trackPointId : tp.trackPointId
  // } else {
  //   return -1
  // }
}

export function getTrackPoints(tracks: Track[]): TrackPoint[] {
  return tracks.reduce<TrackPoint[]>((ps, track) => ps.concat(track.points), [])
}

export function identity<T>(x: T): T {
  return x
}

export function formatTime(t:number){
  const date = new Date(t)
  const hour = date.getHours()
  const hourStr = hour >= 10 ? String(hour) : `0${hour}`
  const minute = date.getMinutes()
  const minuteStr = minute >= 10 ? String(minute) : `0${minute}`
  const second = date.getSeconds()
  const secondStr = second >= 10 ? String(second) : `0${second}`
  return `${hourStr}:${minuteStr}:${secondStr}`
}
