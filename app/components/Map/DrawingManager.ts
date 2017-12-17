import * as d3 from 'd3'
import * as _ from 'lodash'
import { MAX_SCALE, MIN_SCALE } from '../../utils/constants'

interface Padding {
  left: number
  top: number
  right: number
  bottom: number
}

export default class DrawingManager {
  protected svgElement: SVGSVGElement
  protected zoom: d3.ZoomBehavior<SVGSVGElement, null>

  constructor(svg: SVGSVGElement, zoom: d3.ZoomBehavior<SVGSVGElement, null>) {
    this.svgElement = svg
    this.zoom = zoom
  }

  centralize(contentBox: SVGRect, useTransition: boolean, padding: Padding) {
    const targetTransform = DrawingManager.doCentralize(contentBox, {
      width: this.svgElement.clientWidth,
      height: this.svgElement.clientHeight,
    }, padding)
    if (targetTransform) {
      this.zoom.transform(useTransition
        ? d3.select(this.svgElement).transition()
        : d3.select(this.svgElement) as any,
        targetTransform,
      )
    }
  }

  private static doCentralize(
    contentBox: SVGRect,
    viewport: Partial<SVGRect>,
    padding: Padding,
  ) {
    if (contentBox.width === 0) {
      contentBox.width = 200
      contentBox.x -= 100
    }
    if (contentBox.height === 0) {
      contentBox.height = 200
      contentBox.y -= 100
    }
    if (contentBox.width && contentBox.height) {
      const viewBox = {
        x: padding.left,
        y: padding.top,
        width: viewport.width - padding.left - padding.right,
        height: viewport.height - padding.top - padding.bottom,
      }
      const mb = {
        x: contentBox.x,
        y: contentBox.y,
        width: contentBox.width,
        height: contentBox.height,
      }
      const scaleX = viewBox.width / mb.width
      const scaleY = viewBox.height / mb.height
      const scale = _.clamp(Math.min(scaleX, scaleY), MIN_SCALE, MAX_SCALE)
      const dx = (viewBox.x + viewBox.width / 2) - (mb.x + mb.width / 2) * scale
      const dy = (viewBox.y + viewBox.height / 2) - (mb.y + mb.height / 2) * scale
      return d3.zoomIdentity.translate(dx, dy).scale(scale)
    } else {
      return null
    }
  }
}
