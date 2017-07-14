import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { connect } from 'react-redux'
import { fromJS } from 'immutable'
import bindSearchParameters from '../utils/bindSearchParameters'
import FloorList from './FloorList'
import HeatMap from './Map/HeatMap'
import ButtonGroup from './ButtonGroup'
import allItems from '../resources/items.json'

const action = prefix => (...args) => console.log(`[${prefix}]`, ...args)

const searchBindingDefinitons = [
  { key: 'floorId', getter: Number, default: null },
]

const mapStateToProps = ({ floors, settings }, ownProps) => {
  const { floorConfig } = settings
  // calculate floor from floors and floorId
  const { floorId } = ownProps
  const floor = floors.find(flr => flr.floorId === floorId) || floors[0]
  return Object.assign({ floors, floorConfig, floor }, ownProps)
}

@bindSearchParameters(searchBindingDefinitons)
@connect(mapStateToProps)
export default class HeatMapPage extends Component {
  // static propTypes = {
  //   // TODO: 完善propTypes
  //   floorConfig: PropTypes.any.isRequired,
  //   floor: PropTypes.any.isRequired,
  // }

  state = {
    transformReset: false,
  }

  onChangeFloorId = (floorId) => {
    this.props.updateSearch({ floorId })
  }

  render() {
    const { floor, floorConfig, history } = this.props
    const { transformReset } = this.state

    const countResult = _.countBy(allItems, item => item.floorId)

    const floorEntryList = fromJS(floorConfig)
      .map(entry => entry.set('pointsCount', _.get(countResult, entry.get('floorId'), 0)))

    return (
      <div>
        <div className="widgets">
          {/* TODO: 里面的按钮不太对... */}
          <ButtonGroup
            onResetTransform={() => this.setState({ transformReset: true })}
            showPath
            showPoints
            onToggleShowPath={action('toggle-show-path')}
            onToggleShowPoints={action('toggle-show-points')}
            history={history}
          />
          <FloorList
            selectedFloorId={floor.floorId}
            floorEntryList={floorEntryList}
            changeSelectedFloorId={this.onChangeFloorId}
            // todo 重置缩放这个功能可以放在<ButtonGroup />组件中
            onResetTransform={() => this.setState({ transformReset: true })}
          />
        </div>
        <HeatMap
          floor={floor}
          items={allItems.filter(item => item.floorId === floor.floorId)}
          onZoom={() => this.setState({ transformReset: false })}
          transformReset={transformReset}
        />
      </div>
    )
  }
}
