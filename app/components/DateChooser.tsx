import * as React from 'react'
import * as moment from 'moment'
import { Moment } from 'moment'
import '../styles/DateChooser.styl'
import getNow from '../utils/getNow'

interface P {
  time: Moment
  onChangeTime: (m: Moment) => void
}

const minDate = moment('2017-06-20', 'YYYY-MM-DD', true)
const maxDate = moment(getNow()).format('YYYY-MM-DD')

export default class DateChooser extends React.PureComponent<P> {
  couldSelectPrev = () => {
    const { time } = this.props
    const prev = time.clone().subtract(1, 'day')
    return prev.isBetween(minDate, maxDate, 'day', '[]')
  }

  couldSelectNext = () => {
    const { time } = this.props
    const next = time.clone().add(1, 'day')
    return next.isBetween(minDate, maxDate, 'day', '[]')
  }

  onSelectPrevDate = () => {
    if (!this.couldSelectPrev()) {
      return
    }
    const { time, onChangeTime } = this.props
    onChangeTime(time.clone().subtract(1, 'day'))
  }

  onSelectNextDate = () => {
    if (!this.couldSelectNext()) {
      return
    }
    const { time, onChangeTime } = this.props
    onChangeTime(time.clone().add(1, 'day'))
  }

  render() {
    const { time } = this.props

    return (
      <div className="date-chooser">
        <p className="title">时间控制</p>
        <div className="date-chooser-widget">
          <p className="date-chooser-date">{time.format('YYYY-MM-DD')}</p>
          <div className="date-chooser-buttons">
            <button
              onClick={this.onSelectPrevDate}
              style={{ backgroundImage: 'url(/static/img/arrow-up.svg)' }}
            />
            <button
              onClick={this.onSelectNextDate}
              style={{ backgroundImage: 'url(/static/img/arrow-down.svg)' }}
            />
          </div>
        </div>
      </div>
    )
  }
}
