import React, { Component } from 'react'
import '../styles/BrushManager.styl'

export default class TimeBrush extends Component {
  state = {
    cx: 11,
    cursor: 'default',
  }

  getStartClient = (event) => {
    const x = event.clientX
    console.log('start', x)
  }

  render() {
    const { cx, cursor } = this.state
    return (
      <div className="duration-widget">
        <div className="title">时间控制</div>
        <div className="time-selector">
          <svg className="time-box" viewBox="0 0 120 4 ">
            <rect x="10" y="1" width="100" height="1" fill="white" stroke="steelblue"
                  strokeWidth="0.1" cursor={cursor}
                  onMouseDown={(event) => this.setState({ cx: event.clientX / 10 })}
                  onMouseOver={() => this.setState({ cursor: 'pointer' })}
            />
            <circle
              id="circle"
              cx={cx} cy="1.5" r="1" fill="steelblue" stroke="steelblue" strokeWidth="0.1"
              cursor={cursor}
              draggable={true}
              onMouseDown={this.getStartClient}
              // onMouseUp={this.handleMouseUp}
              onMouseOver={() => this.setState({ cursor: 'move' })}
            />
          </svg>
        </div>
      </div>
    )
  }
}
