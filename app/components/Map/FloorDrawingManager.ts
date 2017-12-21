import * as d3 from 'd3'
import * as _ from 'lodash'
import DrawingManager from './DrawingManager'
import { getColor } from '../../utils/utils'

export default class FloorDrawingManager extends DrawingManager {
  private board: d3.Selection<SVGGElement>

  // 第一次绘制地图的时候自动缩放, 后续绘制地图就不需要自动缩放了
  private needAutoResetTransform = true

  constructor(
    svg: SVGSVGElement,
    zoom: d3.ZoomBehavior<SVGSVGElement, null>,
    board: d3.Selection<SVGGElement>,
  ) {
    super(svg, zoom)
    this.board = board
  }

  updateFloor(floor: Floor, hightlightedRegionId: number) {
    this.drawFloor(floor, hightlightedRegionId)
    if (this.needAutoResetTransform) {
      this.resetTransform(false)
      this.needAutoResetTransform = false
    }
  }

  private drawFloor(floor: Floor, hightlightedRegionId: number) {
    // 绘制region
    const regionsLayerJoin = this.board.select('.regions-layer-wrapper')
      .selectAll('g')
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
    const regionFill = (r: Floor.Region) => (
      r.id === hightlightedRegionId ? getColor('semantic') : floor.config.colors[r.color]
    )
    const regionFillOpacity = (r: Floor.Region) => (r.id === hightlightedRegionId ? '0.2' : 1)

    regionsJoin.enter().append('polygon')
      .merge(regionsJoin)
      .attr('fill', regionFill)
      .attr('fill-opacity', regionFillOpacity)
      .attr('points', d => d.points.map(p => `${p.x},${p.y}`).join(' '))
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 0.5)
    regionsJoin.exit().remove()

    const doorLayerJoin = this.board.select('.doors-layer-wrapper')
      .selectAll('g')
      .data([floor.floorId], _.identity)
    const doorLayerEnter = doorLayerJoin.enter()
      .append('g')
      .classed('doors-layer', true)
      .style('opacity', 0)
    doorLayerEnter.transition()
      .style('opacity', 1)
    doorLayerJoin.on('end.remove', null)
      .transition()
      .style('opacity', 1)
    doorLayerJoin.exit()
      .transition()
      .style('opacity', 0)
      .remove()

    const doorsLayer = doorLayerJoin.merge(doorLayerEnter)
    const doorsJoin = doorsLayer.selectAll('line')
      .data(floor.doors)
    doorsJoin.enter()
      .append('line')
      .merge(doorsJoin)
      .attr('stroke', '#a2a1a1')
      .attr('x1', d => d.line.x1)
      .attr('y1', d => d.line.y1)
      .attr('x2', d => d.line.x2)
      .attr('y2', d => d.line.y2)
      .attr('stroke-width', 0.6)
    doorsJoin.exit().remove()

    // 绘制文本
    const textsLayerJoin = this.board.select('.texts-layer-wrapper')
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
      .attr('y', d => d.config.pos.y + 1)
      .attr('font-size', 1.2)
      .attr('fill', '#666')
    textsJoin.exit().remove()

    function getAllLabelConfig() {
      const nodes = floor.nodes.filter(node => node.labelConfig && node.labelConfig.show)
      return nodes.map(node => ({
        text: node.name,
        config: node.labelConfig,
      }))
    }
  }

  resetTransform(useTransition = true) {
    const regionsLayerWrapper = this.board.select('.regions-layer-wrapper').node() as SVGGElement
    const contentBox = regionsLayerWrapper.getBBox()
    this.centralize(contentBox, useTransition, { top: 50, bottom: 50, left: 450, right: 360 })
  }
}
