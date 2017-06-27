import React, { Component } from 'react'
import MacList from './MacList'

const validNameSet = new Set(['sfc-samsung', 'cx-meizu', 'lxy-meizu', 'a', 'b', 'c', 'bob'])
const existedMacSet = new Set(['a0:b1:c2:d3:e4:f5','00-11-22-33-44-55','88:88:88:88:88:88'])

export default class MacListManager extends Component {
  state = {
    validNameSet,
    existedMacSet,
    maclist: ['bob', 'a', 'b', 'c'],
    checkedMacList: ['a', 'b'],
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
    const index = checkedMacList.indexOf(mac)
    if (index === -1) {
      this.setState({ checkedMacList: checkedMacList.concat([mac]) })
    } else {
      checkedMacList.splice(index, 1)
      this.setState({ checkedMacList })
    }
  }

  render() {
    const { maclist, checkedMacList, validNameSet, existedMacSet } = this.state
    return (
      <MacList
        maclist={maclist}
        checkedMacList={checkedMacList}
        deleteItem={this.deleteItem}
        addItem={this.addItem}
        onToggleItem={this.toggleItem}
        validNameSet={validNameSet}
        existedMacSet={existedMacSet}
      />
    )
  }
}
