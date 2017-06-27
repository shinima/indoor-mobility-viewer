import React, { Component } from 'react'
import { getColor, isValidMac } from '../utils/utils.js'
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
    if (maclist.indexOf(macName) !== -1) {
      alert('该用户已存在列表中')
    } else if (validNameSet.has(macName)) {
      this.props.addItem(macName)
      this.setState({ macName: '' })
    } else if (!isValidMac(macName)) {
      alert('请输入正确的mac地址')
      this.setState({ macName: '' })
    } else if (existedMacSet.has(macName)) {
      alert('mac地址重复')
      this.setState({ macName: '' })
    } else {
      this.props.addItem(macName)
      this.setState({ macName: '' })
    }
  }

  handleInputName = (e) => {
    this.setState({ macName: e.target.value })
  }

  render() {
    const { maclist, checkedMacList } = this.props
    const { macName } = this.state
    return (
      <div className="widgets">
        <div className="mac-list-widget">
          <div className="title">MAC地址管理</div>
          <div className="mac-list">
            {maclist.map((mac, index) =>
              <div className="mac-item" key={index}>
                <div className="mac-color">
                  <div className="color" style={{ background: `${getColor(mac)}` }}>
                  </div>
                </div>
                <div className="mac-text">{mac}</div>
                <button className="mac-delete" onClick={() => this.handleDelete(mac)}>Del
                </button>
                <input type="checkbox"
                       checked={checkedMacList.indexOf(mac) !== -1}
                       onChange={() => this.props.onToggleItem(mac)}
                />
              </div>
            )}
          </div>
          <div className="new-mac-item">
            <input type="text" placeholder="macName"
                   onChange={this.handleInputName} value={macName} />
            <button className="button" onClick={this.handleAdd}>Add</button>
          </div>
        </div>
      </div>
    )
  }
}
