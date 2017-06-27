import React, { Component } from 'react'
import { getColor, isValidMac } from '../utils/utils.js'
import '../styles/MacList.styl'

export default class MacList extends Component {
  state = {
    macName: '',
    macAddr: '',
  }

  handleDelete(mac) {
    this.props.deleteItem(mac)
  }

  handleAdd = () => {
    const { macAddr, macName } = this.state
    const { maclist } = this.props
    const object = {
      macAddr: macAddr,
      macName: macName,
    }
    if (!isValidMac(macAddr)) {
      alert('请输入正确的mac地址')
      this.setState({ macAddr: '', macName: '' })
    } else {
      let existingMacAddrArray = maclist.map((item, index) => {
        return item.macAddr
      })
      if (existingMacAddrArray.indexOf(macAddr) !== -1) {
        alert('mac地址重复')
        this.setState({ macAddr: '', macName: '' })
      } else {
        this.props.addItem(object)
        this.setState({ macAddr: '', macName: '' })
      }
    }
  }

  handleInputName = (e) => {
    this.setState({ macName: e.target.value })
  }

  handleInputAddr = (e) => {
    this.setState({ macAddr: e.target.value })
  }

  render() {
    const { maclist, checkedMacList } = this.props
    const { macName, macAddr } = this.state
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
                <div className="mac-text">{mac.macName === '' ? mac.macAddr : mac.macName}</div>
                <button className="mac-delete" onClick={() => this.handleDelete(mac)}>Del
                </button>
                <input type="checkbox"
                       checked={checkedMacList.indexOf(mac.macAddr) !== -1}
                       onChange={() => this.props.onToggleItem(mac)}
                />
              </div>
            )}
          </div>
          <div className="new-mac-item">
            <input className="mac-name" type="text" placeholder="Name"
                   onChange={this.handleInputName} value={macName} />
            <input className="mac-addr" type="text" placeholder="macAddr"
                   onChange={this.handleInputAddr} value={macAddr} />
            <button className="button" onClick={this.handleAdd}>Add</button>
          </div>
        </div>
      </div>
    )
  }
}