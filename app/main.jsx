import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import ReactDOM from 'react-dom'

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

const BasicExample = () => (
  <Router>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/topics">Topics</Link></li>
      </ul>

      <hr />

      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/topics" component={Topics} />
    </div>
  </Router>
)


const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

const Topics = ({ match }) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li><Link to={`${match.url}/topic1`}>Topic 1</Link></li>
      <li><Link to={`${match.url}/topic2`}>Topic 2</Link></li>
      <li><Link to={`${match.url}/topic3`}>Topic 3</Link></li>
    </ul>

    <Route exact path={match.url} render={() => (
      <h3>Please select a topic.</h3>
    )} />
    <Route path={`${match.url}/:topicId`} component={Topic} />
  </div>
)

const Topic = ({match}) => (
<div>
  <h3>{match.params.topicId}</h3>
</div>
)

class App extends Component {
  render() {
  return (
  <BasicExample />
  )
}
}

ReactDOM.render(
<App />
,
document.getElementById('container')
)
