import React, { Component } from 'react'
import { getColor, isValidMac } from '../utils/utils'
import '../styles/MacList.styl'

export default class MacList extends Component {
  // type props = {
  //   macEntryList: List<Map<{ name: string, active: boolean }>>
  //   deleteItem: (name: string) => void
  //   addItem: (name: string) => void
  //   onToggleItem: (name: string) => void
  //   translate用来将mac-name翻译为具体的mac
  //   translate: (name: string) => string
  // }
  state = {
    // 添加新的mac的控件的值
    macName: '',
  }

  componentWillReceiveProps(nextProps) {
    const { macEntryList } = this.props
    if (nextProps.macEntryList.size > macEntryList.size) {
      this.setState({ macName: '' })
    }
  }

  handleAdd = () => {
    const { macEntryList, translate } = this.props
    const { macName } = this.state
    const existedMacs = macEntryList.map(entry => entry.get('name')).map(translate).toSet()
    const mac = translate(macName)
    if (existedMacs.has(mac)) {
      alert('该mac地址已经存在')
    } else if (!isValidMac(mac)) {
      alert('请输入正确的mac地址')
    } else {
      this.props.addItem(macName)
    }
  }

  render() {
    const { macEntryList, translate } = this.props
    const { macName } = this.state

    return (
      <div className="mac-list-widget">
        <div className="title">MAC地址管理</div>
        {macEntryList.isEmpty() ? (
          <div className="empty-mac-item-list">列表暂时为空</div>
        ) : (
          <div className="mac-list">
            {macEntryList.map(macEntry => (
              <div className="mac-item" key={macEntry.get('name')}>
                <div className="mac-color">
                  <div
                    className="color"
                    style={{ background: `${getColor(translate(macEntry.get('name')))}` }}
                  />
                </div>
                <div className="mac-text">{macEntry.get('name')}</div>
                <button
                  className="mac-delete"
                  onClick={() => this.props.deleteItem(macEntry.get('name'))}
                >
                  Del
                </button>
                <input
                  type="checkbox"
                  className="mac-check"
                  checked={macEntry.get('active')}
                  onChange={() => this.props.onToggleItem(macEntry.get('name'))}
                />
              </div>
            ))}
          </div>
        )}
        <div className="new-mac-item">
          <input
            type="text"
            value={macName}
            onChange={e => this.setState({ macName: e.target.value })}
          />
          <button className="button" onClick={this.handleAdd}>Add</button>
        </div>
      </div>
    )
  }
}
