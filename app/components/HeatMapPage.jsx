import React, { Component } from 'react'
import moment from 'moment'
import _ from 'lodash'
import { connect } from 'react-redux'
import { fromJS } from 'immutable'
import bindSearchParameters from '../utils/bindSearchParameters'
import FloorList from './FloorList'
import HeatMap from './Map/HeatMap'
import ButtonGroup from './ButtonGroup'
import TimeChooser from './TimeChooser'
import * as rpc from '../utils/rpcMock'

const action = prefix => (...args) => console.log(`[${prefix}]`, ...args)

const defaultDate = '2017-06-20'

const searchBindingDefinitons = [
  { key: 'floorId', getter: Number, default: null },
  {
    key: 't',
    getter: Number,
    default: moment(defaultDate).valueOf(),
  },
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
    // todo 当天所有的数据
    allItems: [],
  }

  async componentDidMount() {
    const { t } = this.props
    const allItems = await rpc.getLocations(t)
    this.setState({ allItems })
  }

  componentWillReceiveProps(nextProps) {
    if (!moment(nextProps.t).isSame(moment(this.props.t), 'day')) {
      this.setState({ allItems: [] })
    }
  }

  async componentDidUpdate(prevProps) {
    const { t } = this.props
    if (!moment(prevProps.t).isSame(moment(t), 'day')) {
      this.setState({ allItems: await rpc.getLocations(t) })
    }
  }

  onChangeFloorId = (floorId) => {
    this.props.updateSearch({ floorId })
  }

  render() {
    const { floor, floorConfig, history, t } = this.props
    const { transformReset, allItems } = this.state

    // 1小时对应的毫秒数
    const span = 3600e3
    const itemsInSpan = allItems.filter(item => (t - item.time >= 0 && t - item.time < span))
    const countResult = _.countBy(itemsInSpan, item => item.floorId)

    // 在除以240的配置, 一个小时(3600K ms)内, 如达到15K的定位点数量, 则认为最热
    const floorEntryList = fromJS(floorConfig)
      .map(entry => entry.set('pointsCount', _.get(countResult, entry.get('floorId'), 0)))

    const items = itemsInSpan.filter(item => (item.floorId === floor.floorId))

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
          <TimeChooser
            time={moment(t)}
            onChangeTime={m => this.props.updateSearch({ t: m.valueOf() })}
          />
          <FloorList
            max={span / 240}
            selectedFloorId={floor.floorId}
            floorEntryList={floorEntryList}
            changeSelectedFloorId={this.onChangeFloorId}
          />
        </div>
        <HeatMap
          floor={floor}
          items={items}
          span={span}
          onZoom={() => this.setState({ transformReset: false })}
          transformReset={transformReset}
        />
      </div>
    )
  }
}
