import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Slider from '../components/Slider'

class InteractiveSlider extends Component {
  state = {
    value: 0,
  }

  render() {
    const { value } = this.state
    return (
      <Slider
        width={400}
        value={value}
        onChange={v => this.setState({ value: v })}
      />
    )
  }
}

storiesOf('Slider', module)
  .add('static default 0', () => <Slider width={400} value={0} onChange={action('change')} />)
  .add('static default 0.3', () => <Slider width={400} value={0.3} onChange={action('change')} />)
  .add('interactive', () => <InteractiveSlider />)
