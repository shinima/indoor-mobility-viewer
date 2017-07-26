import * as React from 'react'
import { Component } from 'react'
import * as classNames from 'classnames'
import * as d3 from 'd3'
import '../styles/Slider.styl'

function self() {
  return this
}

type P = {
  width: number
  onChange: (value: number) => void
  value: number
}

export default class Slider extends Component<P> {
  rect: d3.Selection<SVGRectElement, null, null, null> = null
  scaleX = d3.scaleLinear()
    .domain([0, 1])
    .clamp(true)

  state = {
    dragging: false,
  }

  componentDidMount() {
    const dragRect = d3.drag().container(self)
    dragRect.on('start', () => {
      this.setState({ dragging: true })
      this.scaleX.range([26, this.props.width - 26])
      this.props.onChange(this.scaleX.invert(d3.event.x))
    }).on('drag', () => {
      this.scaleX.range([26, this.props.width - 26])
      this.props.onChange(this.scaleX.invert(d3.event.x))
    }).on('end', () => {
      this.setState({ dragging: false })
    })
    this.rect.call(dragRect)
  }

  render() {
    const { dragging } = this.state
    const { value, width } = this.props
    const height = 18
    const x = this.scaleX.range([26, width - 26])(value)

    return (
      <svg className="slider" style={{ width, height }}>
        <line x1={26} x2={x} y1={9} y2={9} strokeWidth="2" stroke="steelblue" />
        <line x1={x} x2={width - 26} y1={9} y2={9} strokeWidth="2" stroke="#b9b9b9" />
        <circle
          className={classNames({ dragging, lowest: value === 0 })}
          cx={x}
          cy={9}
          r={5}
        />
        <rect
          ref={node => (this.rect = d3.select(node))}
          style={{ cursor: 'pointer' }}
          x="20"
          width={width - 40}
          height={height}
          fill="transparent"
        />
      </svg>
    )
  }
}
