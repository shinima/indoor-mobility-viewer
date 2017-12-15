import * as React from 'react'
import { Component } from 'react'
import { Dispatch } from 'redux'
import { BrowserRouter, HashRouter, Route, Switch } from 'react-router-dom'
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
