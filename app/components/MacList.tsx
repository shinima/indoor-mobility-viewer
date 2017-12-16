import * as React from 'react'
import { Component } from 'react'
import { Map } from 'immutable'
import { getColor } from '../utils/utils'
import Checkbox from './Checkbox'
import '../styles/MacList.styl'

interface P {
  macEntryMap: Map<string, boolean>
  onDeleteMacEntry: (name: string) => void
  onAddMacEntry: (name: string) => void
  onToggleMacEntry: (name: string) => void
  onCentralizeFirstTrack: (name: string) => void
  // translate用来将mac-name翻译为具体的mac
  translate: (name: string) => string
}

type S = {
  macName: string
}

export default class MacList extends Component<P, S> {
  state = {
    // 添加新的mac的控件的值
    macName: '',
  }

  componentWillReceiveProps(nextProps: P) {
    const { macEntryMap } = this.props
    if (nextProps.macEntryMap.size > macEntryMap.size) {
      this.setState({ macName: '' })
    }
  }

  handleAdd = () => {
    const { macEntryMap, translate } = this.props
    const { macName } = this.state
    const existedMacs = macEntryMap.keySeq().map(translate).toSet()
    const mac = translate(macName)
    if (existedMacs.has(mac)) {
      alert('该mac地址已经存在')
      // } else if (!isValidMac(mac)) {
      //   alert('请输入正确的mac地址')
    } else {
      this.props.onAddMacEntry(macName)
    }
  }

  render() {
    const { macEntryMap, translate, onCentralizeFirstTrack } = this.props
    const { macName } = this.state

    return (
      <div className="mac-list-widget">
        <div className="title">
          轨迹
          <button style={{ marginLeft: 8 }}>打开其他轨迹</button>
        </div>
        {macEntryMap.isEmpty() ? (
          <div className="empty-mac-item-list">列表暂时为空</div>
        ) : (
          <div className="mac-list">
            {macEntryMap.map((active, name) => (
              <div className="mac-item" key={name}>
                <button
                  onClick={() => onCentralizeFirstTrack(name)}
                  className="mac-color"
                  style={{ background: `${getColor(translate(name))}` }}
                />
                <div className="mac-text">{name}</div>
                <img
                  style={{ height: 16 }}
                  src={'/static/img/delete2.svg'}
                  alt="delete"
                  className="mac-delete"
                  onClick={() => this.props.onDeleteMacEntry(name)}
                />
                <Checkbox checked={active} onChange={() => this.props.onToggleMacEntry(name)} />
              </div>
            )).toArray()}
          </div>
        )}
        <div className="new-mac-item">
          <input
            type="text"
            value={macName}
            onChange={e => this.setState({ macName: e.target.value })}
          />
          <button className="add-button" onClick={this.handleAdd} />
        </div>
      </div>
    )
  }
}
