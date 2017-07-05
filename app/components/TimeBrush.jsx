import React, { Component } from 'react'
import * as d3 from 'd3'
import '../styles/BrushManager.styl'

export default class TimeBrush extends Component {
  render() {
    return (
      <div className="duration-widget">
        <div className="title">时间控制</div>
        <p className="duration">
          <span>总时间区间</span>
          <select>
            <option value="1">1分钟</option>
            <option value="5">5分钟</option>
            <option value="60">1小时</option>
            <option value="180">3小时</option>
          </select>
        </p>
        <div className="span-info">
          <p className="span-start">
            <span className="text">起始时间</span>
            <span className="value">startTime</span>
          </p>
          <p className="span-end">
            <span className="text">终止时间</span>
            <span className="value">endTime</span>
          </p>
          <p className="span-length">
            <span className="text">时间区间</span>
            <span className="value">timeLength</span>
          </p>
          <svg className="brush-container">???</svg>
        </div>
      </div>
    )
  }
}
