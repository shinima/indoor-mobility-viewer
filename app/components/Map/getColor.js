import * as d3 from 'd3'

const colors = d3.schemeCategory10

const map = new Map()

export default function getColor(key) {
  if (!map.has(key)) {
    map.set(key, map.size)
  }
  return colors[map.get(key) % colors.length]
}
