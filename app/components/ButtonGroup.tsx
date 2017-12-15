import * as React from 'react'
import { History } from 'history'
import { Component } from 'react'
import Checkbox from './Checkbox'
import '../styles/ButtonGroup.styl'

interface P {
  showPath: boolean
  showPoints: boolean
  showNoise: boolean
  showMembers: boolean
  history: History
  onResetTransform: () => void
  onToggleShowPath: () => void
  onToggleShowPoints: () => void
  onToggleShowNoise: () => void
  onToggleShowMembers: () => void
}

export default class ButtonGroup extends Component<P> {
  handle = -1

  componentDidMount() {
    this.handle = setInterval(() => {
      this.setState({
      })
    }, 1000) as any
  }

  componentWillUnmount() {
    clearInterval(this.handle)
  }

  render() {
    const { showPath, showPoints, showNoise, showMembers } = this.props
    const {
      onResetTransform,
      onToggleShowPath,
      onToggleShowPoints,
      onToggleShowNoise,
      onToggleShowMembers,
    } = this.props

    return (
      <div className="button-group-widget">
        <div className="reset-transform-button-wrapper">
          <button
            className="reset-transform-button"
            onClick={onResetTransform}
          >
            居中地图
            <img src="/static/img/reset-transform-icon.svg" />
          </button>
        </div>
        <div className="checkboxes-widget">
          <p className="title">轨迹显示</p>
          <div className="checkboxes-row">
            <div className="checkbox-wrapper" onClick={onToggleShowPoints}>
              <Checkbox checked={showPoints} />
              <p>显示轨迹点</p>
            </div>
            <div className="checkbox-wrapper" onClick={onToggleShowPath}>
              <Checkbox checked={showPath} />
              <p>显示轨迹</p>
            </div>
          </div>
          <div className="checkboxes-row">
            <div className="checkbox-wrapper" onClick={onToggleShowNoise}>
              <Checkbox checked={showNoise} />
              <p>显示噪声</p>
            </div>
            <div className="checkbox-wrapper" onClick={onToggleShowMembers}>
              <Checkbox checked={showMembers} />
              <p>显示成员</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
