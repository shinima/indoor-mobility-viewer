import React, { Component } from 'react'
import { fromJS } from 'immutable'
import MacList from '../components/MacList'
import MacItem from '../types/MacItem'

export default class MacListManager extends Component {
  state = {
    maclist: [
      {
        macAddr: '101.12.21',
        macName: 'bob',
      },
      {
        macAddr: '10.214.22',
        macName: 'alice',
      },
      {
        macAddr: '10.214.45',
        macName: 'alice',
      },
      {
        macAddr: '10.214.222',
        macName: 'alice',
      }],
  }

  deleteMac = (macAddr) => {
    const { maclist } = this.state
    alert(`you will delete the record whose macAddress is ${macAddr}`)
    // this.setState({maclist: maclist.del})
  }

  addMac = () => {
    console.log('add')
  }

  render() {
    const { maclist } = this.state
    const mac = fromJS(maclist).toMap()
      .map(MacItem)
      .mapKeys((_, mac) => mac.macAddr)
    return (
      <MacList
        maclist={mac}
        deleteMac={this.deleteMac}
        addMac={this.addMac}
      />
    )
  }
}