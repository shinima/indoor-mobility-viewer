import React, { Component } from 'react'
import { getColor, isValidMac } from '../utils/utils'
import '../styles/MacList.styl'

export default class MacList extends Component {
  // type props = {
  //   macEntryMap: Map<MacName -> boolean>
  //   onDeleteMacEntry: (name: string) => void
  //   onAddMacEntry: (name: string) => void
  //   ontoggleMacEntry: (name: string) => void
  //   onHighlightFirstTrack: (name: string) => void
  //   onCentralizeFirstTrack: (name: string) => void
  //   translate用来将mac-name翻译为具体的mac
  //   translate: (name: string) => string
  // }
  state = {
    // 添加新的mac的控件的值
    macName: '',
  }

  componentWillReceiveProps(nextProps) {
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
    } else if (!isValidMac(mac)) {
      alert('请输入正确的mac地址')
    } else {
      this.props.onAddMacEntry(macName)
    }
  }

  render() {
    const { macEntryMap, translate, onHighlightFirstTrack, onCentralizeFirstTrack } = this.props
    const { macName } = this.state

    return (
      <div className="mac-list-widget">
        <div className="title">MAC地址管理</div>
        {macEntryMap.isEmpty() ? (
          <div className="empty-mac-item-list">列表暂时为空</div>
        ) : (
          <div className="mac-list">
            {macEntryMap.map((active, name) => (
              <div className="mac-item" key={name}>
                <div className="mac-color">
                  <button
                    onClick={() => onHighlightFirstTrack(name)}
                    onDoubleClick={() => onCentralizeFirstTrack(name)}
                    className="color"
                    style={{ background: `${getColor(translate(name))}` }}
                  />
                </div>
                <div className="mac-text">{name}</div>
                <div
                  className="mac-delete"
                  onClick={() => this.props.onDeleteMacEntry(name)}
                >
                  <img
                    style={{ width: 18, height: 18 }}
                    src={'/static/img/delete.svg'}
                    alt="delete"
                  />
                </div>
                <div className="mac-check" onClick={() => this.props.onToggleMacEntry(name)}>
                  <img
                    style={{ width: '20px', height: '20px' }}
                    src={`/static/img/buttonGroup/${active ? 'check-box' : 'check-box-empty'}.svg`}
                    alt="checkbox"
                  />
                </div>
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
          <div className="button" onClick={this.handleAdd}>
            <img
              style={{ width: 20, height: 20 }}
              src={'/static/img/add.svg'}
              alt="add"
            />
          </div>
        </div>
      </div>
    )
  }
}
