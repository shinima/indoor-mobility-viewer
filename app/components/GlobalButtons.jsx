import React, { Component } from 'react'
import Button from './Button'
import '../styles/globalButtons.styl'

export default class GlobalButtons extends Component {
  render() {
    const { history } = this.props
    return (
      <div>
        <div className="title">按钮组</div>
        <div className="global-button">
          <Button
            icon={'/static/img/buttonGroup/home.svg'}
            text="主页"
            altText="home"
            onClick={() => history.push('/')}
          />
          <Button
            icon={'/static/img/buttonGroup/setting.svg'}
            text="设置"
            altText="setting"
            onClick={() => history.push('/settings')}
          />
        </div>
      </div>
    )
  }
}
