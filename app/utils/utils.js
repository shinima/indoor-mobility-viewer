import * as d3 from 'd3'

const colors = d3.schemeCategory10

let map = new Map()
export function getColor(key) {
  if (!map.has(key)) {
    map.set(key, map.size)
  }
  return colors[map.get(key) % colors.length]
}

export function isValidMac(mac) {
  return /([0-9a-f]{2}:){5}[0-9a-f]{2}/i.test(mac)
}