import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'

export default class HomePage extends Component {
  render() {
    return (
      <h1>Home Page</h1>
    )
  }
}

storiesOf('HomePage', module)
  .add('temp', () => <HomePage />)
