import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import MacList from '../components/MacList'

const validNameSet = new Set(['sfc-samsung', 'cx-meizu', 'lxy-meizu', 'a', 'b', 'c', 'bob'])
const existedMacSet = new Set(['a0:b1:c2:d3:e4:f5', '00-11-22-33-44-55', '88:88:88:88:88:88'])

class MacListManager extends Component {
  state = {
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
    const newMaclist = maclist.map((item) => {
      if (mac.name === item.name) {
        return Object.assign({}, item, { active: !item.active })
      } else {
        return item
      }
    })
    this.setState({ maclist: newMaclist })
  }

  render() {
    const { maclist } = this.state
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

storiesOf('MacListManager', module)
  .add('static', () => (
    <MacList
      maclist={[
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
      ]}
      deleteItem={action('delete-mac-item')}
      addItem={action('add-mac-item')}
      onToggleItem={action('choose-mac-item')}
      validNameSet={validNameSet}
      existedMacSet={existedMacSet}
    />
  ))
  .add('interactive', () => <MacListManager />)
  .add('empty', () => (
    <MacList
      maclist={[]}
      addItem={action('add-mac-list-item')}
      validNameSet={validNameSet}
      existedMacSet={existedMacSet}
    />
  ))
