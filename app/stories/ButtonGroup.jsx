import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

class ButtonGroup extends Component {
  render() {
    return (
      <div>
        <button>Button1</button>
      </div>
    )
  }
}

storiesOf('ButtonGroup', module)
  .add('1', () => <ButtonGroup />)

