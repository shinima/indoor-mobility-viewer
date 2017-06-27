import React, { Component } from 'react'
import MacList from './MacList'

export default class MacListManager extends Component {
  state = {
    maclist: [
      {
        macAddr: '101.12.21',
        macName: 'bob',
      },
      {
        macAddr: '10.214.22',
        macName: 'a',
      },
      {
        macAddr: '10.214.45',
        macName: 'b',
      },
      {
        macAddr: '10.214.222',
        macName: 'c',
      }],
    checkedMacList: ['10.214.45', '10.214.22'],
  }

  deleteItem = (mac) => {
    const { maclist } = this.state
    const index = maclist.indexOf(mac)
    maclist.splice(index, 1)
    this.setState({ maclist })
  }

  addItem = (object) => {
    const { maclist } = this.state
    const newMacList = maclist.concat(object)
    this.setState({ maclist: newMacList })
  }

  toggleItem = (mac) => {
    const { checkedMacList } = this.state
    const index = checkedMacList.indexOf(mac.macAddr)
    if (index === -1) {
      this.setState({ checkedMacList: checkedMacList.concat([mac.macAddr]) })
    } else {
      checkedMacList.splice(index, 1)
      this.setState({ checkedMacList })
    }
  }

  render() {
    const { maclist, checkedMacList } = this.state
    return (
      <MacList
        maclist={maclist}
        checkedMacList={checkedMacList}
        deleteItem={this.deleteItem}
        addItem={this.addItem}
        onToggleItem={this.toggleItem}
      />
    )
  }
}