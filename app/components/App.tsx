import * as React from 'react'
import { Dispatch } from 'redux'
import { Component } from 'react'
import { Switch, HashRouter, BrowserRouter, Route, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import TrackMapPage from './TrackMapPage'
import HeatMapPage from './HeatMapPage'

const Router = process.env.NODE_ENV === 'production' ? BrowserRouter : HashRouter

type AppProp = {
  dispatch: Dispatch<S.State>
}

export default class App extends Component<AppProp> {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/track-map" component={TrackMapPage} />
          <Route path="/heat-map" component={HeatMapPage} />
          <Route path="/comparison" component={ComparisonPage} />
        </Switch>
      </Router>
    )
  }
}

const ComparisonPage = () => (
  <div>
    <h3>这个页面还在紧张地制作中</h3>
    <Link to="/">回到首页</Link>
  </div>
)

const Home = () => (
  <div>
    <h3>欢迎使用空间定位数据查看工具集</h3>
    <p>该工具集包含了下面几个工具:</p>
    <ul>
      <li><Link to="/track-map">轨迹图</Link></li>
      <li><Link to="/heat-map">热度图</Link></li>
      <li><Link to="/comparison">区域对比图</Link></li>
    </ul>
    <p>当然还有一个<Link to="/settings">设置页面</Link></p>
    <p><a target="_blank" href="/static/doc-for-development.html">开发者文档</a></p>
  </div>
)
