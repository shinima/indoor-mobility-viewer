import * as React from 'react'
import { List, Map, OrderedMap } from 'immutable'
import { connect } from 'react-redux'
import Checkbox from './Checkbox'
import fetchCXServer from '../utils/fetchCXServer'
import { CXTracking, PointType } from '../utils/TestDatInterface'
import { Arg, config } from '../utils/config'
import convertTrackings from '../utils/convertTrackings'
import '../styles/AlgorithmChooser.styl'

function extractClusterDefaultValues(clusterType: string) {
  const args = config.cluster.find(c => c.clusterType === clusterType).args
  return List(args.map(arg => arg.defaultValue))
}

function extractFixerDefaultValues(fixerType: string) {
  const args = config.floorFixer.find(f => f.fixerType === fixerType).args
  return List(args.map(arg => arg.defaultValue))
}

interface P {
  macEntryMap: OrderedMap<string, boolean>
  dispatch?: Dispatch
}

interface S {
  fixerType: string
  clusterType: string
  clusterValues: List<any>
  fixerValues: List<any>
}

class AlgorithmChooser extends React.Component<P, S> {
  constructor() {
    super()
    const clusterType = config.cluster[0].clusterType
    const fixerType = config.floorFixer[0].fixerType
    this.state = {
      fixerType,
      clusterType,
      clusterValues: extractClusterDefaultValues(clusterType),
      fixerValues: extractFixerDefaultValues(fixerType),
    }
  }

  valueChangeFactory = (key: 'clusterValues' | 'fixerValues') => (index: number, value: any) => {
    const { [key]: values, clusterType } = this.state
    const args = config.cluster.find(c => c.clusterType === clusterType).args

    const argType = args[index].type
    let newValue = value
    if (argType === 'boolean') {
      newValue = Boolean(value)
    } else if (argType === 'int' || argType === 'double' || argType === 'oddInt') {
      newValue = Number(value)
    } else {
      newValue = String(value)
    }
    this.setState({ [key]: values.set(index, newValue) } as any)
  }

  onChangeClusterValue = this.valueChangeFactory('clusterValues')
  onChangeFixerValue = this.valueChangeFactory('fixerValues')

  onChangeClusterType = (e: any) => {
    const clusterType = e.target.value
    this.setState({
      clusterType,
      clusterValues: extractClusterDefaultValues(clusterType),
    })
  }

  onChangeFixerType = (e: any) => {
    const fixerType = e.target.value
    this.setState({
      fixerType,
      fixerValues: extractFixerDefaultValues(fixerType),
    })
  }

  onSubmit = async () => {
    const { dispatch, macEntryMap } = this.props
    const { clusterType, clusterValues, fixerType, fixerValues } = this.state
    const macs = macEntryMap.keySeq().toArray()
    const data = await fetchCXServer(macs, clusterType, clusterValues, fixerType, fixerValues)

    dispatch<Action>({
      type: 'UPDATE_LOCATION_ITEMS',
      locationItems: data.locations,
    })

    dispatch<Action>({
      type: 'UPDATE_TRACKS',
      tracks: convertTrackings(data.trackings),
    })
  }

  render() {
    const { clusterType, clusterValues, fixerType, fixerValues } = this.state
    const clusterArgs = config.cluster.find(c => c.clusterType === clusterType).args
    const fixerArgs = config.floorFixer.find(f => f.fixerType === fixerType).args

    return (
      <div className="algorithms-chooser">
        <h2 className="title">FloorFixer Algorithm</h2>
        <section>
          <span className="label">Type</span>
          <select value={fixerType} onChange={this.onChangeFixerType}>
            {config.floorFixer.map(({ fixerType }) =>
              <option key={fixerType} value={fixerType}>{fixerType}</option>
            )}
          </select>
          <Args
            args={fixerArgs}
            values={fixerValues}
            onChange={this.onChangeFixerValue}
          />
        </section>

        <h2 className="title">Cluster Algorithm</h2>
        <section className="cluster-chooser">
          <div className="label">Type</div>
          <select value={clusterType} onChange={this.onChangeClusterType}>
            {config.cluster.map(({ clusterType }) =>
              <option key={clusterType} value={clusterType}>{clusterType}</option>
            )}
          </select>
          <Args
            args={clusterArgs}
            values={clusterValues}
            onChange={this.onChangeClusterValue}
          />
        </section>

        <button className="submit-button" onClick={this.onSubmit}>提交</button>
      </div>
    )
  }
}

function Args({ args, values, onChange }: {
  args: Arg[], values: List<any>, onChange: (i: number, v: any) => void
}) {
  return (
    <div>
      {args.map((arg, i) => {
        if (arg.type === 'enum') {
          return (
            <div key={arg.name} className="arg-row flex-align-start" title={arg.desc}>
              <div className="label no-shrink">{arg.name}</div>
              <div className="button-list" style={{ marginLeft: -5 }}>
                {arg.values.map(v =>
                  <label key={v}>
                    <input
                      key={v}
                      type="radio"
                      checked={v === values.get(i)}
                      onChange={e => onChange(i, v)}
                    />
                    {v}
                  </label>
                )}
              </div>
            </div>
          )
        } else if (arg.type === 'double' || arg.type === 'int' || arg.type === 'oddInt') {
          return (
            <div key={arg.name} className="arg-row" title={arg.desc}>
              <span className="label">{arg.name}</span>
              {/* TODO max min step */}
              <input
                type="number"
                value={values.get(i)}
                onChange={e => onChange(i, e.target.value)}
              />
            </div>
          )
        } else if (arg.type === 'boolean') {
          return (
            <div key={arg.name} className="arg-row" title={arg.desc}>
              <span className="label">{arg.name}</span>
              <Checkbox
                checked={values.get(i)}
                onChange={v => onChange(i, v)}
              />
            </div>
          )
        }
      })}
    </div>
  )
}

function mapStateProps(state: S.State, ownProps: P) {
  return ownProps
}

export default connect(mapStateProps)(AlgorithmChooser)
