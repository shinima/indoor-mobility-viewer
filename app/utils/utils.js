import * as d3 from 'd3'
import { Component } from 'react'

const colors = d3.schemeCategory10

const map = new Map()
export function getColor(key) {
  if (!map.has(key)) {
    map.set(key, map.size)
  }
  return colors[map.get(key) % colors.length]
}

export function isValidMac(mac) {
  return /([0-9a-f]{2}:){5}[0-9a-f]{2}/i.test(mac)
}

export class IComponent extends Component {
  makeIUpdateFn(key) {
    return (updater) => {
      this.setState(({ [key]: old }) => ({ [key]: updater(old) }))
    }
  }
}

export function makeTranslateFn(staticMacMapping) {
  // translate函数将macItem的名字翻译为真实mac地址
  return function translate(name) {
    const entry = staticMacMapping.find(item => item.name === name)
    return entry ? entry.mac : name
  }
}

export function makeHumanizeFn(staticMacMapping) {
  return function humanize(mac) {
    const entry = staticMacMapping.find(item => item.mac === mac)
    return entry ? entry.name : mac
  }
}
