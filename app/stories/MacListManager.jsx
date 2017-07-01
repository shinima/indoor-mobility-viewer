import React from 'react'
import { fromJS, Map } from 'immutable'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import MacList from '../components/MacList'
import staticMacMapping from '../resources/static-mac-mapping.json'
import { IComponent, makeTranslateFn } from '../utils/utils'

const defaultMacEntryList = fromJS(staticMacMapping.map(item => ({
  name: item.name,
  active: Math.random() > 0.5,
})))

// eslint-disable-next-line react/no-multi-comp
class MacListManager extends IComponent {
  update = this.makeIUpdateFn('macEntryList')
  state = {
    macEntryList: defaultMacEntryList,
  }

  deleteItem = (macName) => {
    this.update(list => list.filterNot(entry => entry.get('name') === macName))
  }

  addItem = (name) => {
    this.update(list => list.push(Map({ name, active: true })))
  }

  toggleItem = (macName) => {
    this.update(list => list.map((entry) => {
      if (entry.get('name') === macName) {
        return entry.set('active', !entry.get('active'))
      } else {
        return entry
      }
    }))
  }

  render() {
    const { macEntryList } = this.state
    return (
      <MacList
        macEntryList={macEntryList}
        deleteItem={this.deleteItem}
        addItem={this.addItem}
        onToggleItem={this.toggleItem}
        translate={makeTranslateFn(staticMacMapping)}
      />
    )
  }
}

storiesOf('MacListManager', module)
  .add('static', () => (
    <MacList
      macEntryList={defaultMacEntryList}
      deleteItem={action('delete-mac-item')}
      addItem={action('add-mac-item')}
      onToggleItem={action('choose-mac-item')}
      translate={makeTranslateFn(staticMacMapping)}
    />
  ))
  .add('interactive', () => <MacListManager />)
  .add('empty', () => (
    <MacList
      macEntryList={defaultMacEntryList.clear()}
      addItem={action('add-mac-list-item')}
    />
  ))
