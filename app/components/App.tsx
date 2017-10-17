import * as React from 'react'
import { Dispatch } from 'redux'
import { Component } from 'react'
import { Switch, HashRouter, BrowserRouter, Route, Link } from 'react-router-dom'
import TrackMapPage from './TrackMapPage'

const Router = process.env.NODE_ENV === 'production' ? BrowserRouter : HashRouter

type AppProp = {
  dispatch: Dispatch<S.State>
}

export default class App extends Component<AppProp> {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" component={TrackMapPage} />
        </Switch>
      </Router>
    )
  }
}
