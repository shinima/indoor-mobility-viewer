import React from 'react'
import { Map } from 'immutable'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import MacList from '../components/MacList'
import staticMacMapping from '../resources/static-mac-mapping.json'
import { IComponent, makeTranslateFn } from '../utils/utils'

const not = x => !x
const defaultMacEntryMap = Map(staticMacMapping.map(({ name }) => [name, true]))

class InteractiveMacList extends IComponent {
  update = this.makeIUpdateFn('macEntryMap')
  state = {
    macEntryMap: defaultMacEntryMap,
  }

  onDeleteMacEntry = (macName) => {
    this.update(map => map.delete(macName))
  }

  onAddMacEntry = (macName) => {
    this.update(map => map.set(macName, true))
  }

  onToggleMacEntry = (macName) => {
    this.update(map => map.update(macName, not))
  }

  render() {
    const { macEntryMap } = this.state
    return (
      <MacList
        macEntryMap={macEntryMap}
        onDeleteMacEntry={this.onDeleteMacEntry}
        onAddMacEntry={this.onAddMacEntry}
        onToggleMacEntry={this.onToggleMacEntry}
        translate={makeTranslateFn(staticMacMapping)}
      />
    )
  }
}

storiesOf('MacListManager', module)
  .add('static', () => (
    <MacList
      macEntryMap={defaultMacEntryMap}
      onDeleteMacEntry={action('delete-mac-entry')}
      onAddMacEntry={action('add-mac-entry')}
      onToggleMacEntry={action('toggle-mac-entry')}
      translate={makeTranslateFn(staticMacMapping)}
    />
  ))
  .add('empty', () => (
    <MacList
      macEntryMap={defaultMacEntryMap.clear()}
      onDeleteMacEntry={action('delete-mac-entry')}
      onAddMacEntry={action('add-mac-entry')}
      onToggleMacEntry={action('toggle-mac-entry')}
      translate={makeTranslateFn(staticMacMapping)}
    />
  ))
  .add('interactive', () => <InteractiveMacList />)
