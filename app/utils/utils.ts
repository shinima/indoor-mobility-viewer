import * as d3 from 'd3'
import { TrackPoint } from '../interfaces'

const colors = d3.schemeCategory10

const map = new Map()

/** 获取 key 对应的颜色 */
export function getColor(key: string) {
  if (!map.has(key)) {
    map.set(key, map.size)
  }
  return colors[map.get(key) % colors.length]
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
