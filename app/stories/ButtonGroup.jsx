import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Button from '../components/Button'
import '../styles/ButtonGroup.styl'

class ButtonGroup extends Component {
  render() {
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
        <div className="function-button">
          <Button
            icon={'/static/img/buttonGroup/center.svg'}
            text="居中地图"
            altText="center"
          />
          <Button
            icon={'/static/img/buttonGroup/check-box.svg'}
            text="显示轨迹"
            altText="showLine"
          />
          <Button
            icon={'/static/img/buttonGroup/check-box-empty.svg'}
            text="显示轨迹点"
            altText="showPoints"
          />
        </div>
        <div className="change-track">
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

