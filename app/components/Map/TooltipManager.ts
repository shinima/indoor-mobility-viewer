import * as d3 from 'd3'
import { TrackPoint } from '../../interfaces'
import * as moment from 'moment'

export default class TooltipManager {
  tooltipWrapper: d3.Selection<HTMLDivElement>
  zoom: d3.ZoomBehavior<SVGSVGElement, null>
  svgElement: SVGSVGElement
  target: TrackPoint

  constructor(
    tooltipWrapper: d3.Selection<HTMLDivElement>,
    zoom: d3.ZoomBehavior<SVGSVGElement, null>,
    svgElement: SVGSVGElement,
  ) {
    this.tooltipWrapper = tooltipWrapper
    this.zoom = zoom
    this.svgElement = svgElement

    this.zoom.on('zoom.tooltip-content', this.update)
    this.update()
  }

  setTarget(target: TrackPoint) {
    this.target = target
  }

  update = () => {
    const transform = d3.zoomTransform(this.svgElement)
    this.tooltipWrapper
      .style('left', `${transform.x}px`)
      .style('top', `${transform.y}px`)

    if (this.target) {
      const x = transform.applyX(this.target.x) - transform.x
      const y = transform.applyY(this.target.y) - transform.y
      const start = this.target.time
      const end = this.target.time + this.target.duration
      const verb = this.target.event === "stay" ? "stay around" : "pass through"
      const preposition = start === end ? "at" : "during"
      // language=TEXT
      this.tooltipWrapper.html(`
        <div style="left: ${x}px; top: ${y}px;">
          ${verb} <i>${this.target.regionName}</i>
          <br />
          ${preposition}
          ${moment(start).format('HH:mm:ss')}
          ${end > start ? `-- ${moment(end).format('HH:mm:ss')}` : ''}
        </div>
      `).style('display', 'block')
    } else {
      this.tooltipWrapper.style('display', 'none')
    }
  }
}
