import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { fromJS } from 'immutable'
import { connect } from 'react-redux'
import StaticMacMapping from './StaticMacMapping'
import rpc from '../utils/rpc'
import * as A from '../actionTypes'

@connect(({ settings: { staticMacItems } }) => ({ staticMacItems }))
export default class SettingsPage extends Component {
  componentDidMount() {
    this.fetchMacData()
  }

  fetchMacData = () => {
    const get = rpc('get-static-mac-mappings')
    get().then(response => {
      if (response.ok) {
        const data = fromJS(response.mappings)
          .toOrderedMap()
          .mapKeys((__, entry) => entry.get('id'))
        this.props.dispatch({
          type: A.UPDATE_MAC_ITEMS,
          data,
        })
      }
    })
  }

  editMacItem = (id, macItem) => {
    const update = rpc('update-static-mac-mapping')
    update(id, macItem.get('name'), macItem.get('mac')).then(response => {
      if (response.ok) {
        this.props.dispatch({
          type: A.EDIT_MAC_ITEM,
          id,
          macItem,
        })
      }
    })

  }

  deleteMacItem = (id) => {
    const deleteMac = rpc('delete-static-mac-mapping')
    deleteMac(id).then(response => {
      if (response.ok) {
        this.props.dispatch({
          type: A.DELETE_MAC_ITEM,
          id,
        })
      }
    })
  }

  addMacItem = (name, mac) => {
    const add = rpc('add-static-mac-mapping')
    add(name, mac).then(response => {
      if (response.ok) {
        this.props.dispatch({
          type: A.ADD_MAC_ITEM,
          id: response.id,
          name,
          mac,
        })
      }
    })
  }

  render() {
    const { staticMacItems } = this.props
    return (
      <div>
        <h3>这里是设置页面 <Link to="/">回到首页</Link></h3>
        <StaticMacMapping
          staticMacItems={staticMacItems}
          onEditMacItem={this.editMacItem}
          onDeleteMacItem={this.deleteMacItem}
          onAddMacItem={this.addMacItem}
        />
      </div>
    )
  }
}
