import * as React from 'react'
import { Component } from 'react'
import { History } from 'history'
import * as moment from 'moment'
import * as _ from 'lodash'
import { connect } from 'react-redux'
import { fromJS } from 'immutable'
import bindSearchParameters, { SearchParamBinding } from '../utils/bindSearchParameters'
import FloorList from './FloorList'
import HeatMap from './Map/HeatMap'
import GlobalButtons from './GlobalButtons'
import Button from './Button'
import TimeChooser from './TimeChooser'
import * as rpc from '../utils/rpc'
import LocationItemCache from '../utils/LocationItemCache'

const action = (prefix: string) => (...args: any[]) => console.log(`[${prefix}]`, ...args)

const defaultDate = '2017-06-20'

const searchBindingDefinitons = [
  { key: 'floorId', getter: Number, default: null },
  {
    key: 't',
    getter: Number,
    default: moment(defaultDate).valueOf(),
  },
]

type Def = {
  floorId: number
  t: number
}

const mapStateToProps = ({ floors, settings }: S.State, ownProps: Def) => {
  const { floorConfig } = settings
  // calculate floor from floors and floorId
  const { floorId } = ownProps
  const floor = floors.find(flr => flr.floorId === floorId) || floors[0]
  return Object.assign({ floors, floorConfig, floor }, ownProps)
}

type Prop = SearchParamBinding<Def> & {
  floors: Floor[]
  floorConfig: S.FloorConfig
  floor: Floor
}

type State = {
  transformReset: boolean
  items: LocationItem[]
}

class HeatMapPage extends Component<Prop, State> {
  private cache: LocationItemCache

  state = {
    transformReset: false,
    items: [] as LocationItem[],
  }

  async componentDidMount() {
    const { t, floor: { floorId } } = this.props
    const start = t - 600e3
    this.cache = new LocationItemCache(floorId)
    this.cache.setSegment(start, t)
    this.cache.on('set-items', (items: LocationItem[]) => {
      this.setState({ items })
    })
    // todo will-unmount 中需要清理资源
  }

  async componentDidUpdate(prevProps: Prop) {
    const { t, floor: { floorId } } = this.props
    if (prevProps.t !== t || prevProps.floor.floorId !== floorId) {
      const start = t - 600e3
      this.cache = new LocationItemCache(floorId)
      this.cache.setSegment(start, t)
      this.cache.on('set-items', (items: LocationItem[]) => {
        this.setState({ items })
      })
    }
  }

  onChangeFloorId = (floorId: number) => {
    this.props.updateSearch({ floorId })
  }

  render() {
    const { floor, floorConfig, history, t } = this.props
    const { transformReset, items } = this.state

    // 1小时对应的毫秒数
    const span = 600e3
    // const itemsInSpan = allItems.filter(item => (t - item.time >= 0 && t - item.time < span))
    // const countResult = _.countBy(itemsInSpan, item => item.floorId)

    // 在除以240的配置, 一个小时(3600K ms)内, 如达到15K的定位点数量, 则认为最热
    const floorEntryList = fromJS(floorConfig)
    // .map((entry: any) => entry.set('pointsCount', _.get(countResult, entry.get('floorId'), 0)))
      .map((entry: any) => entry.set('pointsCount', 0))

    // const items = itemsInSpan.filter(item => (item.floorId === floor.floorId))

    return (
      <div>
        <div className="widgets">
          <GlobalButtons history={history} />
          <Button
            style={{ border: '1px solid steelblue', borderTop: 'none' }}
            icon={'/static/img/buttonGroup/center.svg'}
            text="居中地图"
            altText="center"
            onClick={() => this.setState({ transformReset: true })}
          />
          <TimeChooser
            time={moment(t)}
            hasSlider
            onChangeTime={m => this.props.updateSearch({ t: m.valueOf() }, true)}
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

export default bindSearchParameters(searchBindingDefinitons)(connect(mapStateToProps)(HeatMapPage))
