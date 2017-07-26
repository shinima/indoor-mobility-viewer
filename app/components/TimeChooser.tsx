import * as React from 'react'
import { Component } from 'react'
import * as moment from 'moment'
import { Moment } from 'moment'
import * as PropTypes from 'prop-types'
import Slider from './Slider'
import '../styles/TimeChooser.styl'

type P = {
  time: Moment
  onChangeTime: (m: Moment) => void
  hasSlider: boolean
}

export default class TimeChooser extends Component<P> {
  static propTypes = {
    time: PropTypes.instanceOf(moment).isRequired,
    onChangeTime: PropTypes.func.isRequired,
  }

  onSelectPrevDate = () => {
    const { time, onChangeTime } = this.props
    onChangeTime(time.clone().subtract(1, 'day'))
  }

  onSelectNextDate = () => {
    const { time, onChangeTime } = this.props
    onChangeTime(time.clone().add(1, 'day'))
  }

  onChangeValue = (value: number) => {
    const { time, onChangeTime } = this.props
    if (value === 1) {
      // -1毫秒是为了防止日期发生变化
      onChangeTime(time.clone().startOf('day').add(24 * 3600e3 - 1, 'ms'))
    } else {
      onChangeTime(time.clone().startOf('day').add(value * 24 * 3600e3, 'ms'))
    }
  }

  render() {
    const { time, hasSlider } = this.props
    const ms = time.valueOf() - time.clone().startOf('day').valueOf()

    return (
      <div className="time-chooser">
        <div className="title">时间控制</div>
        <div className="date">
          <p className="time-display">
            {time.format('YYYY-MM-DD')}
            {hasSlider ? <small>{time.format('HH:mm:ss')}</small> : null}
          </p>
          <svg
            width="20"
            height="20"
            className="button"
            onClick={this.onSelectPrevDate}
          >
            <polygon points="20,0 20,20 0,10" fill="steelblue" />
          </svg>
          <svg
            width="20"
            height="20"
            className="button next"
            onClick={this.onSelectNextDate}
          >
            <polygon points="0,0 20,10 0,20" fill="steelblue" />
          </svg>
        </div>
        {hasSlider ? <Slider
          width={238}
          value={ms / (24 * 3600e3)}
          onChange={this.onChangeValue}
        /> : null}
      </div>
    )
  }
}
