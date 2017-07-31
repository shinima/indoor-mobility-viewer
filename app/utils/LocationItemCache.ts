import * as rpc from '../utils/rpc'
import * as moment from 'moment'
import { EventEmitter } from 'events'

type Seg = { left: number, right: number }

export default class LocationItemCache extends EventEmitter {
  private segs: Seg[] = []
  private floorId: number
  private data: LocationItem[] = []
  // todo 添加一个低优先级队列来实现后台加载/预加载功能
  // todo 支持多个下载任务, 目前只支持单个下载任务
  private pendingTasks: Function[] = []
  private running = false
  private cntSeg: Seg = null

  constructor(floorId: number) {
    super()
    this.floorId = floorId
  }

  private runFirstPendingTask() {
    const task = this.pendingTasks.shift()
    if (task) {
      task()
    }
  }

  async setSegment(left: number, right: number) {
    // this.emit('set-items', this.getItemsBetweenSeg({ left, right }))
    const items = await this.query(left, right)
    this.emit('set-items', items)
  }

  /** 判断一个时间段的数据是否完整 */
  private isComplete(seg: Seg) {
    const segs = subtract(seg, this.segs)
    return segs.length === 0
  }

  private getItemsBetweenSeg(seg: Seg) {
    if (this.data.length === 0) {
      return []
    }
    const startIndex = binarySearchFirstGte(this.data, seg.left, item => item.time)
    const endIndex = binarySearchFirstGte(this.data, seg.right, item => item.time)
    return this.data.slice(startIndex, endIndex)
  }

  query(start: number, end: number): Promise<LocationItem[]> {
    // 精确到秒, 因为mysql查询的时候用的精度为秒
    start = Math.floor(start / 1000) * 1000
    end = Math.floor(end / 1000) * 1000

    const startMoment = moment(start)
    const endMoment = moment(end)
    // 如果start和end跨越了一天, 则使用end所在的那天
    if (!startMoment.isSame(endMoment, 'day')) {
      start = endMoment.startOf('day').valueOf()
    }
    if (start === end) {
      return Promise.resolve([])
    }

    return new Promise(resolve => {
      this.pendingTasks.push(async () => {
        try {
          this.running = true
          const seg = { left: start, right: end }
          await this.load(subtract(seg, this.segs))
          resolve(this.getItemsBetweenSeg(seg))
        } finally {
          this.running = false
          this.runFirstPendingTask()
        }
      })
      if (!this.running) {
        this.runFirstPendingTask()
      }
      // 去掉原先的tasks
      if (this.pendingTasks.length > 3) {
        this.pendingTasks.splice(2, this.pendingTasks.length - 3)
      }
    })
  }

  private async load(segs: Seg[]) {
    for (const seg of segs) {
      const { ok, data } = await rpc.getLocationsByTime(seg.left, seg.right, [this.floorId])
      if (ok) {
        this.addSeg(seg)
        this.addData(data)
      } else {
        throw new Error('load error')
      }
    }
  }

  private addSeg(seg: Seg) {
    const size = this.segs.length
    if (size === 0) {
      this.segs.push(seg)
      return
    }
    const first = this.segs[0]
    const last = this.segs[size - 1]
    if (seg.left < first.left) {
      if (seg.right === first.left) {
        first.left = seg.left
      } else {
        this.segs.unshift(seg)
      }
      return
    }
    if (seg.left >= last.right) {
      if (seg.left === last.right) {
        last.right = seg.right
      } else {
        this.segs.push(seg)
      }
      return
    }

    let index = 0
    while (index < this.segs.length && this.segs[index].left < seg.left) {
      index += 1
    }
    const prevSeg = this.segs[index - 1]
    const nextSeg = this.segs[index]
    if (prevSeg.right === seg.left && seg.right === nextSeg.left) {
      prevSeg.right = nextSeg.right
      this.segs.splice(index, 1)
    } else if (prevSeg.right === seg.left) {
      prevSeg.right = seg.right
    } else if (seg.right === nextSeg.left) {
      nextSeg.left = seg.left
    } else {
      this.segs.splice(index, 0, seg)
    }
  }

  private addData(slice: LocationItem[]) {
    if (this.data.length === 0) {
      this.data = slice
    } else {
      const insertIndex = binarySearchFirstGte(this.data, slice[0].time, item => item.time)
      this.data = this.data.slice(0, insertIndex)
        .concat(slice)
        .concat(this.data.slice(insertIndex))
    }
  }
}

function subtract(query: Readonly<Seg>, segs: ReadonlyArray<Readonly<Seg>>): Seg[] {
  // 取出query.left, 避免对query进行原地修改
  let queryLeft = query.left
  const result: Seg[] = []
  let index = 0
  while (index < segs.length && segs[index].right <= queryLeft) {
    index += 1
  }
  while (queryLeft < query.right && index < segs.length) {
    const seg = segs[index]
    if (seg.left >= query.right) {
      break
    }
    if (queryLeft < seg.left) {
      result.push({ left: queryLeft, right: seg.left })
    }
    queryLeft = seg.right
    index += 1
  }
  if (queryLeft < query.right) {
    result.push(query)
  }
  return result
}

// 二分搜索: 找到第一个大于等于value的元素的下标
function binarySearchFirstGte<T>(array: T[], value: number, getter: (t: T) => number) {
  if (value <= getter(array[0])) {
    return 0
  }
  let start = 0
  let end = array.length
  while (start <= end - 2) {
    const middle = Math.floor((start + end) / 2)
    const middleValue = getter(array[middle])
    if (middleValue < value) {
      start = middle
    } else {
      end = middle
    }
  }
  return end
}
