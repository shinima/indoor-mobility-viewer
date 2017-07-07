import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import '../styles/Legend.styl'
import TrackPointSymbol from '../components/TrackPointSymbol'


export default class Legend extends Component {
  render() {
    const fill = '#888888'
    return (
      <div className="points-list-widget">
        <div className="title">图例说明</div>
        <div className="points-list">
          <div className="box">
            <div className="symbol">
              <TrackPointSymbol
                pointType="track-start"
                fill={fill}
              />
            </div>
            <div className="text">起始点</div>
          </div>
          <div className="box">
            <div className="symbol">
              <TrackPointSymbol
                pointType="normal"
                fill={fill}
              />
            </div>
            <div className="text">停留点</div>
          </div>
          <div className="box">
            <div className="symbol">
              <TrackPointSymbol
                pointType="track-end"
                fill={fill}
              />
            </div>
            <div className="text">终止点</div>
          </div>

        </div>

      </div>
    )
  }
}

storiesOf('PointSymbol', module)
  .add('static', () => <Legend />)
