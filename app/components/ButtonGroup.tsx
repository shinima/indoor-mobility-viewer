import * as React from 'react'
import  * as moment from 'moment'
import { History } from 'history'
import { Component } from 'react'
import Button from './Button'
import GlobalButtons from './GlobalButtons'
import getNow from '../utils/getNow'
import '../styles/ButtonGroup.styl'

type P = {
  showPath: boolean
  showPoints: boolean
  history: History
  onResetTransform: () => void
  onToggleShowPath: () => void
  onToggleShowPoints: () => void
}

export default class ButtonGroup extends Component<P> {
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
        <div className="real-time">
          {moment(this.state.now).format('MM-DD HH:mm:ss')}
        </div>
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
