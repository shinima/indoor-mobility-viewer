import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Button from '../components/Button'
import '../styles/ButtonGroup.styl'

export default class ButtonGroup extends Component {
  state = {
    showPath: true,
    showPoints: true,
  }

  render() {
    const { showPath, showPoints } = this.state
    const { onResetTransform, onChangeShowPath, onChangeShowPoints } = this.props
    const pathCheckStatus = showPath ? 'check-box' : 'check-box-empty'
    const pointsCheckStatus = showPoints ? 'check-box' : 'check-box-empty'
    return (
      <div className="button-group-widget">
        <div className="title">按钮组</div>
        <div className="global-button">
          <Button
            icon={'/static/img/buttonGroup/home.svg'}
            text="主页"
            altText="home"
          />
          <Button
            icon={'/static/img/buttonGroup/setting.svg'}
            text="设置"
            altText="setting"
          />
        </div>
        <div className="block">
          <Button
            icon={'/static/img/buttonGroup/center.svg'}
            text="居中地图"
            altText="center"
            clickEvent={onResetTransform}
          />
          <Button
            icon={`/static/img/buttonGroup/${pathCheckStatus}.svg`}
            text="显示轨迹"
            altText="showPath"
            clickEvent={() => {
              this.setState({ showPath: !showPath })
              onChangeShowPath(!showPath)
            }}
          />
          <Button
            icon={`/static/img/buttonGroup/${pointsCheckStatus}.svg`}
            text="显示轨迹点"
            altText="showPoints"
            clickEvent={() => {
              this.setState({ showPoints: !showPoints })
              onChangeShowPoints(!showPoints)
            }}
          />
        </div>
        <div className="block">
          <Button
            icon={'/static/img/buttonGroup/previous.svg'}
            text="上一条轨迹"
            altText="previous"
          />
          <Button
            icon={'/static/img/buttonGroup/next.svg'}
            text="下一条轨迹"
            altText="next"
          />
        </div>
      </div>
    )
  }
}

storiesOf('ButtonGroup', module)
  .add('static', () => <ButtonGroup />)

