import * as React from 'react'
import { Map } from 'immutable'
import { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import StaticMacMapping from './StaticMacMapping'
// import * as rpc from '../utils/rpc'
import * as rpc from '../utils/rpcMock'
import * as A from '../actionTypes'

type Prop = {
  dispatch: Dispatch
  staticMacItems: S.StaticMacItems
}

class SettingsPage extends Component<Prop> {
  editMacItem = async (id: number, macItem: Map<string, string>) => {
    const { ok } = await rpc.updateStaticMacMapping(id, macItem.get('name'), macItem.get('mac'))
    if (ok) {
      this.props.dispatch({ type: A.EDIT_MAC_ITEM, id, macItem })
    } else {
      alert('Edit mac-item error.')
    }
  }

  deleteMacItem = async (id: number) => {
    const { ok } = await rpc.deleteStaticMacMapping(id)
    if (ok) {
      this.props.dispatch({ type: A.DELETE_MAC_ITEM, id })
    } else {
      alert('Delete static-mac-mapping error.')
    }
  }

  addMacItem = async (name: string, mac: string) => {
    if (name === '' || mac === '') {
      alert('name和mac均不可为空')
    } else {
      const { ok, id } = await rpc.addStaticMacMapping(name, mac)
      if (ok) {
        this.props.dispatch({ type: A.ADD_MAC_ITEM, id, name, mac })
        // } else {
        //   alert(message)
      }
    }
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

const mapStateToProps = ({ settings: { staticMacItems } }: S.State) => ({ staticMacItems })

export default connect(mapStateToProps)(SettingsPage)
