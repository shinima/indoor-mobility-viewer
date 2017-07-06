import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { Route, Link, HashRouter as Router } from 'react-router-dom'
import StaticMacMappingContainer from '../stories/StaticMacMapping'

export default class HomePage extends Component {
  render() {
    return (
      <h1>Home Page</h1>
    )
  }
}

const BasicExample = () => (
  <Router>
    <div>
      <ul>
        <li><Link to="/">HomePage</Link></li>
        <li><Link to="/setting">staticmapping</Link></li>
      </ul>
      <Route exact path="/" component={HomePage} />
      <Route path="/setting" component={StaticMacMappingContainer} />
    </div>
  </Router>
)

storiesOf('HomePage', module)
  .add('temp', () => <BasicExample />)
