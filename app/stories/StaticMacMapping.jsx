import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { fromJS, List } from 'immutable'
import StaticMacMapping from '../components/StaticMacMapping'

// type Mac = string
// type StaticMacItem = {
//   id: number
//   name: string
//   mac: Mac
// }

const staticMacItems = fromJS({
  1: { id: 1, name: 'sfc-samsung', mac: 'a0:b1:c2:d3:e4:f5' },
  2: { id: 2, name: 'cx-meizu', mac: '00-11-22-33-44-55' },
  3: { id: 3, name: 'lxy-meizu', mac: '88:88:88:88:88:88' },
}).mapKeys(Number)

class StaticMacMappingContainer extends Component {
  state = {
    staticMacItems,
  }

  onEditMacItem = (macItemId, newMacItem) => {
    this.setState({ staticMacItems: this.state.staticMacItems.mergeIn([macItemId], newMacItem) })
  }

  render() {
    return (
      <StaticMacMapping
        staticMacItems={this.state.staticMacItems}
        onEditMacItem={this.onEditMacItem}
        onDeleteMacItem={macItemId => this.setState({ staticMacItems: this.state.staticMacItems.delete(macItemId) })}
      />
    )
  }
}


storiesOf('StaticMacMapping', module)
  .add('static', () =>
    <StaticMacMapping
      staticMacItems={staticMacItems}
      onEditMacItem={action('edit-mac-item')}
      onDeleteMacItem={action('delete-mac-item')}
    />
  )
  .add('empty', () => <StaticMacMapping staticMacItems={List()} />)
  .add('interactive', () => <StaticMacMappingContainer />)
