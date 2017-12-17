import * as d3 from 'd3'
import { Component } from 'react'

const colors = d3.schemeCategory10

const map = new Map()

export function getColor(key: string) {
  if (!map.has(key)) {
    map.set(key, map.size)
  }
  return colors[map.get(key) % colors.length]
}

export class IComponent<P={}, S={}> extends Component<P, S> {
  makeIUpdateFn(key: string) {
    return (updater: <T>(old: T) => T) => {
      this.setState(({ [key]: old }) => ({ [key]: updater(old) }))
    }
  }
}

export function avg(ns: number[]) {
  let sum = 0
  for (const n of ns) {
    sum += n
  }
  return sum / ns.length
}
