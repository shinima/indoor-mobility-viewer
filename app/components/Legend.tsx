import * as React from 'react'
import { Component } from 'react'
import TrackPointSymbol from '../components/TrackPointSymbol'
import '../styles/Legend.styl'

export default class Legend extends Component {
  render() {
    const fill = 'steelblue'
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
