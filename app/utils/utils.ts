import * as d3 from 'd3'
import { List } from 'immutable'
import { Component } from 'react'

type StaticMacMapping = List<{ name: string, mac: string }>

const colors = d3.schemeCategory10

const map = new Map()

export function getColor(key: string) {
  if (!map.has(key)) {
    map.set(key, map.size)
  }
  return colors[map.get(key) % colors.length]
}

export function isValidMac(mac: string) {
  return /([0-9a-f]{2}:){5}[0-9a-f]{2}/i.test(mac)
}

export class IComponent<P={}, S={}> extends Component<P, S> {
  makeIUpdateFn(key: string) {
    return (updater: <T>(old: T) => T) => {
      this.setState(({ [key]: old }) => ({ [key]: updater(old) }))
    }
  }
}

export function makeTranslateFn(staticMacMapping: StaticMacMapping) {
  // translate函数将macItem的名字翻译为真实mac地址
  return function translate(name: string) {
    const entry = staticMacMapping.find(item => item.name === name)
    return entry ? entry.mac : name
  }
}

export function makeHumanizeFn(staticMacMapping: StaticMacMapping) {
  return function humanize(mac: string) {
    const entry = staticMacMapping.find(item => item.mac === mac)
    return entry ? entry.name : mac
  }
}

export function avg(ns: number[]) {
  let sum = 0
  for (const n of ns) {
    sum += n
  }
  return sum / ns.length
}
