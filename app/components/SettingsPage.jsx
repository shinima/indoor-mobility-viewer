import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import StaticMacMapping from './StaticMacMapping'
import * as A from '../actionTypes'

@connect(({ settings: { staticMacItems } }) => ({ staticMacItems }))
export default class SettingsPage extends Component {
  render() {
    const { staticMacItems, dispatch } = this.props
    return (
      <div>
        <h3>这里是设置页面 <Link to="/">回到首页</Link></h3>
        <StaticMacMapping
          staticMacItems={staticMacItems}
          onEditMacItem={(id, macItem) => dispatch({
            type: A.EDIT_MAC_ITEM,
            id,
            macItem,
          })}
          onDeleteMacItem={id => dispatch({
            type: A.DELETE_MAC_ITEM,
            id,
          })}
        />
      </div>
    )
  }
}
