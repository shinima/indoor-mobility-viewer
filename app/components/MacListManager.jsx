import React, { Component } from 'react'
import MacList from './MacList'

const validNameSet = new Set(['sfc-samsung', 'cx-meizu', 'lxy-meizu', 'a', 'b', 'c', 'bob'])
const existedMacSet = new Set(['a0:b1:c2:d3:e4:f5', '00-11-22-33-44-55', '88:88:88:88:88:88'])

export default class MacListManager extends Component {
  state = {
    validNameSet,
    existedMacSet,
    // maclist: ['bob', 'a', 'b', 'c'],
    // checkedMacList: ['a', 'b'],
    // todo refactor data structure
    maclist: [
      {
        name: 'bob',
        active: false,
      },
      {
        name: 'a',
        active: true,
      },
      {
        name: 'b',
        active: true,
      },
      {
        name: 'c',
        active: false,
      },
    ],
  }

  deleteItem = (mac) => {
    const { maclist } = this.state
    const macNameArray = maclist.map(item => item.name)
    // console.log(macNameArray)
    const index = macNameArray.indexOf(mac)
    const newMacList = maclist.slice(0, index).concat(maclist.slice(index + 1))
    this.setState({ maclist: newMacList })
  }

  addItem = (object) => {
    const { maclist } = this.state
    const newMacList = maclist.concat([object])
    this.setState({ maclist: newMacList })
  }

  toggleItem = (mac) => {
    const { maclist } = this.state
    // todo 更改maclist中mac的active属性 如何操作object？？？
    // const checkedMacList = maclist.filter(item => item.active).map(item => item.name)
    // console.log(checkedMacList)
    // const index = checkedMacList.indexOf(macName)
    //
    // if (index === -1) {
    //   this.setState({ checkedMacList: checkedMacList.concat([macName]) })
    // } else {
    //   const newCheckedMacList = checkedMacList.slice(0, index).concat(checkedMacList.slice(index + 1))
    //   this.setState({ checkedMacList: newCheckedMacList })
    // }
  }

  render() {
    const { maclist, validNameSet, existedMacSet } = this.state
    return (
      <MacList
        maclist={maclist}
        deleteItem={this.deleteItem}
        addItem={this.addItem}
        onToggleItem={this.toggleItem}
        validNameSet={validNameSet}
        existedMacSet={existedMacSet}
      />
    )
  }
}
