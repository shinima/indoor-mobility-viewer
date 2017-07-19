import React, { Component } from 'react'
import Button from './Button'
import GlobalButtons from './GlobalButtons'
import '../styles/ButtonGroup.styl'

export default class ButtonGroup extends Component {
  render() {
    const { showPath, showPoints, history } = this.props
    const {
      onResetTransform,
      onToggleShowPath,
      onToggleShowPoints,
    } = this.props
    const pathCheckStatus = showPath ? 'check-box' : 'check-box-empty'
    const pointsCheckStatus = showPoints ? 'check-box' : 'check-box-empty'

    return (
      <div className="button-group-widget">
        <GlobalButtons history={history} />
        <div className="block">
          <Button
            icon={'/static/img/buttonGroup/center.svg'}
            text="居中地图"
            altText="center"
            onClick={onResetTransform}
          />
          <Button
            icon={`/static/img/buttonGroup/${pathCheckStatus}.svg`}
            text="显示轨迹"
            altText="showPath"
            onClick={onToggleShowPath}
          />
          <Button
            icon={`/static/img/buttonGroup/${pointsCheckStatus}.svg`}
            text="显示轨迹点"
            altText="showPoints"
            onClick={onToggleShowPoints}
          />
        </div>
      </div>
    )
  }
}
