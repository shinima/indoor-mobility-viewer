import * as d3 from 'd3'
import * as _ from 'lodash'

// 在svgElement上绘制地图
export default function drawFloor(floor: Floor, svgElement: SVGSVGElement) {
  const svg = d3.select(svgElement)
  const board = svg.select('.board')

  // 绘制region
  const regionsLayerJoin = board.select('.regions-layer-wrapper')
    .selectAll('g').classed('regions-layer', true)
    .data([floor.floorId], _.identity)
  const regionsLayerEnter = regionsLayerJoin.enter()
    .append('g')
    .classed('regions-layer', true)
    .style('opacity', 0)
  regionsLayerEnter.transition()
    .style('opacity', 1)
  regionsLayerJoin.on('end.remove', null)
    .transition()
    .style('opacity', 1)
  regionsLayerJoin.exit()
    .transition()
    .style('opacity', 0)
    .remove()
  const regionsLayer = regionsLayerJoin.merge(regionsLayerEnter)

  const regionsJoin = regionsLayer.selectAll('polygon').data(floor.regions)
  regionsJoin.enter().append('polygon')
    .merge(regionsJoin)
    .attr('fill', d => floor.config.colors[d.color])
    .attr('points', d => d.points.map(p => `${p.x},${p.y}`).join(' '))
    .attr('stroke', '#cccccc')
    .attr('stroke-width', 0.5)
  regionsJoin.exit().remove()

  // 绘制文本
  const textsLayerJoin = board.select('.texts-layer-wrapper')
    .selectAll('g').classed('texts-layer', true)
    .data([floor.floorId], _.identity)
  const textsLayerEnter = textsLayerJoin.enter()
    .append('g')
    .classed('texts-layer', true)
    .style('opacity', 0)
  textsLayerEnter.transition()
    .style('opacity', 1)
  textsLayerJoin.on('end.remove', null)
    .transition()
    .style('opacity', 1)
  textsLayerJoin.exit()
    .transition()
    .style('opacity', 0)
    .remove()
  const textsLayer = textsLayerJoin.merge(textsLayerEnter)
  const textsJoin = textsLayer.selectAll('text').data(getAllLabelConfig())
  textsJoin.enter().append('text')
    .merge(textsJoin)
    .text(d => d.text)
    .attr('x', d => d.config.pos.x)
    .attr('y', d => d.config.pos.y)
    .attr('font-size', d => d.config.fontSize)
  textsJoin.exit().remove()

  function getAllLabelConfig() {
    const nodes = floor.nodes.filter(node => node.labelConfig && node.labelConfig.show)
    return nodes.map(node => ({
      text: node.name,
      config: node.labelConfig,
    }))
  }
}
