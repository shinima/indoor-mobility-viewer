import React, { Component } from 'react'
import { getColor, isValidMac } from '../utils/utils'
import '../styles/MacList.styl'

export default class MacList extends Component {
  state = {
    macName: '',
  }

  handleDelete(mac) {
    this.props.deleteItem(mac)
  }

  handleAdd = () => {
    const { macName } = this.state
    const { maclist, validNameSet, existedMacSet } = this.props
    const object = {
      name: macName,
      active: false,
    }
    if (maclist.map(item => item.name).indexOf(macName) !== -1) {
      alert('该用户已存在列表中')
    } else if (validNameSet.has(macName)) {
      this.props.addItem(object)
      this.setState({ macName: '' })
    } else if (!isValidMac(macName)) {
      alert('请输入正确的mac地址')
    } else if (existedMacSet.has(macName)) {
      alert('mac地址重复')
    } else {
      this.props.addItem(object)
      this.setState({ macName: '' })
    }
  }

  render() {
    const { maclist } = this.props
    const { macName } = this.state
    return (
      <div className="widgets">
        <div className="mac-list-widget">
          <div className="title">MAC地址管理</div>
          <div className="mac-list">
            {maclist.map((mac, index) => (
              <div className="mac-item" key={index}>
                <div className="mac-color">
                  <div className="color" style={{ background: `${getColor(mac.name)}` }} />
                </div>
                <div className="mac-text">{mac.name}</div>
                <button className="mac-delete" onClick={() => this.handleDelete(mac.name)}>Del
                </button>
                <input
                  type="checkbox"
                  checked={mac.active}
                  onChange={() => this.props.onToggleItem(mac)}
                />
              </div>
            ))}
          </div>
          <div className="new-mac-item">
            <input
              type="text"
              value={macName}
              onChange={e => this.setState({ macName: e.target.value })}
            />
            <button className="button" onClick={this.handleAdd}>Add</button>
          </div>
        </div>
      </div>
    )
  }
}
