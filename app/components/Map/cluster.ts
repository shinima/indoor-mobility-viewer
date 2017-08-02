import * as _ from 'lodash'
import getNow from '../../utils/getNow'

class MajorityHelper {
  private map = new Map<number, number>()

  add(x: number) {
    if (this.map.has(x)) {
      this.map.set(x, this.map.get(x) + 1)
    } else {
      this.map.set(x, 1)
    }
  }

  remove(x: number) {
    this.map.set(x, this.map.get(x) - 1)
  }

  getMajority() {
    let majority: number = null
    for (const [x, count] of this.map.entries()) {
      if (majority === null || count > this.map.get(majority)) {
        majority = x
      }
    }
    return majority
  }

  getMajorityCount() {
    let majorityCount = 0
    for (const [x, count] of this.map.entries()) {
      if (count > majorityCount) {
        majorityCount = count
      }
    }
    return majorityCount
  }
}

function distance2(p1: Point, p2: Point) {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
}

// locations: LocationItem[]
// type LocationItem = {
//   floorId: number
//   id: number
//   mac: string
//   x: number
//   y: number
//   time: number
// }
// 函数返回值类型 Track[]
// type Track = {
//   // 第一个点的id, 用来唯一标识track
//   trackId: number
//   duration: number
//   floorId: number
//   mac: string
//   startTime: number
//   endTime: number
//   points: TrackPoint[]
// }
// type TrackPoint = {
//   trackPointId: number
//   floorId: number
//   // 轨迹起始点 | 轨迹结束点 | 普通的轨迹点
//   pointType: 'track-start' | 'track-end' | 'normal'
//   // 停留时长; 0表示经过点; 单位为毫秒
//   duration: number
//   x: number
//   y: number
//   time: number
// }
export default function cluster(locations: LocationItem[]): Track[] {
  const windowSize = 5
  const threshhold = 3
  // 步骤一: 楼层去抖 (对数据原地修改)
  // 最近30个点中某一个楼层的点超过20, 就认为进入了该楼层
  const majorityHelper = new MajorityHelper()

  const first30Locations = locations.slice(0, windowSize)
  first30Locations.forEach(l => majorityHelper.add(l.floorId))
  let floorId = majorityHelper.getMajority()
  // eslint-disable-next-line no-param-reassign
  first30Locations.forEach(l => (l.floorId = floorId))

  for (let index = windowSize; index < locations.length; index += 1) {
    majorityHelper.remove(locations[index - windowSize].floorId)
    majorityHelper.add(locations[index].floorId)

    const cntLocation = locations[index]
    if (majorityHelper.getMajorityCount() >= threshhold) {
      floorId = majorityHelper.getMajority()
    }
    cntLocation.floorId = floorId
  }

  // 步骤二: 划分track
  // 时间相差小于30s且空间相差小于10m认为是同一个trackPoint
  // 时间相差小于1h认为是同一个track
  // notice 最近10分钟的定位点不需要进行聚类
  const now = getNow()
  // const oldLocations = locations.filter(loc => now - loc.time > 10 * 60e3)
  // const realtimeLocations = locations.filter(loc => now - loc.time <= 10 * 60e3)
  const tracks: Partial<Track>[] = []
  let pending = []
  let cntTrack: Partial<Track> = null
  for (const location of locations) {
    const lastPending = pending[pending.length - 1]
    if (cntTrack === null
      || location.floorId !== lastPending.floorId
      || location.time - lastPending.time > 3600e3) {
      // 产生新的track
      if (cntTrack !== null) {
        cntTrack.points.push(makeTrackPoint(pending))
        pending = []
        tracks.push(cntTrack)
      }
      // notice 其他属性在最后会加上
      cntTrack = { points: [] }
    } else if (location.time - lastPending.time > 3600e3
      // notice 目前大概250像素对应实际距离10米
      || distance2(location, lastPending) > 250 ** 2
      || now - location.time <= 60e3) {
      // 产生新的trackPoint
      cntTrack.points.push(makeTrackPoint(pending))
      pending = []
    }
    pending.push(location)
  }
  cntTrack.points.push(makeTrackPoint(pending))
  tracks.push(cntTrack)

  for (const track of tracks) {
    const first = _.first(track.points)
    const last = _.last(track.points)
    if (last.pointType !== 'raw') {
      last.pointType = 'track-end'
    }
    first.pointType = 'track-start'
    track.duration = last.time + last.duration - first.time
    track.floorId = first.floorId
    track.trackId = first.trackPointId
    track.mac = first.mac
    track.startTime = first.time
    track.endTime = last.time + last.duration
  }
  return tracks as Track[]


  function makeTrackPoint(pending: LocationItem[]): TrackPoint {
    const size = pending.length
    const first = _.first(pending)
    if (size === 1 && now - first.time <= 60e3) {
      // 产生实时轨迹点
      return {
        trackPointId: first.id,
        mac: first.mac,
        floorId: first.floorId,
        pointType: 'raw',
        duration: 0,
        x: first.x,
        y: first.y,
        time: first.time,
      }
    }

    const last = _.last(pending)
    return {
      trackPointId: first.id,
      mac: first.mac,
      floorId: first.floorId,
      // notice 这里pointType均为normal
      pointType: 'normal',
      duration: last.time - first.time,
      x: _.sumBy(pending, 'x') / size,
      y: _.sumBy(pending, 'y') / size,
      time: first.time,
    }
  }
}
