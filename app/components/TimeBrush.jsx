import React, { Component } from 'react'
import '../styles/BrushManager.styl'

export default class TimeBrush extends Component {
  state = {
    x: 25,
    cursor: 'default',
  }

  onMouseDown = (event) => {
    this.dragStartX = event.clientX
    this.startX = this.state.x
    this.dragging = true
  }

  onMouseUp = () => {
    this.dragging = false
  }

  onMouseOver = (event) => {
    if (this.dragging) {
      this.setState({ x: event.clientX + this.startX - this.dragStartX })
    }
  }

  startX = 0
  dragStartX = 0
  dragging = false

  render() {
    const { x, cursor } = this.state
    return (
      <div className="duration-widget">
        <div className="title">时间控制</div>
        <div className="time-selector">
          <svg className="time-box">
            <rect
              x="25"
              y="10"
              width="350"
              height="20"
              fill="white"
              stroke="steelblue"
              strokeWidth="1"
              cursor={cursor}
              onMouseDown={(event) => this.setState({ x: event.clientX })}
              onMouseOver={this.onMouseOver}
            />
            <circle
              cx={x}
              cy="20"
              r="15"
              fill="steelblue"
              stroke="steelblue"
              strokeWidth="0.1"
              cursor={cursor}
              draggable={true}
              onMouseDown={this.onMouseDown}
              onMouseUp={this.onMouseUp}
            />
          </svg>
        </div>
      </div>
    )
  }
}
