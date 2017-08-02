import * as React from 'react'
import * as moment from 'moment'
import { History } from 'history'
import { Component } from 'react'
import Button from './Button'
import getNow from '../utils/getNow'
import '../styles/globalButtons.styl'

type P = {
  history: History
}

export default class GlobalButtons extends Component<P> {
  state = {
    now: getNow(),
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        now: getNow(),
      })
    }, 1000)
  }

  render() {
    const { history } = this.props
    return (
      <div>
        <div className="title">
          <h1>{moment(this.state.now).format('MM-DD HH:mm:ss')}</h1>
          按钮组
        </div>
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
