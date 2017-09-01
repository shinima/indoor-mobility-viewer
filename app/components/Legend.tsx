import * as React from 'react'
import { Component } from 'react'
import TrackPointSymbol from '../components/TrackPointSymbol'
import '../styles/Legend.styl'

export default class Legend extends Component {
  render() {
    const fill = '#99ccff'
    return (
      <div className="legend">
        <div className="box">
          <div className="text">起始点</div>
          <TrackPointSymbol
            pointType="track-start"
            fill={fill}
          />
        </div>
        <div className="box">
          <div className="text">停留点</div>
          <TrackPointSymbol
            pointType="normal"
            fill={fill}
          />
        </div>
        <div className="box">
          <div className="text">终止点</div>
          <TrackPointSymbol
            pointType="track-end"
            fill={fill}
          />
        </div>
      </div>
    )
  }
}
