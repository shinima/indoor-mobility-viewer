import * as React from 'react'
import { Component } from 'react'
import { is, Map } from 'immutable'
import { isValidMac } from '../utils/utils'
import { MacItemRecord } from '../reducer'
import '../styles/StaticMacMapping.styl'

type ChangeEvent = React.ChangeEvent<HTMLInputElement>

type MacItemRowProps = {
  macItem: MacItemRecord
  onEdit: (editInfo: { name: string, mac: string }) => void
  onDelete: () => void
}

type MacItemRowState = {
  name: string
  mac: string
  editing: boolean
}

class MacItemRow extends Component<MacItemRowProps, MacItemRowState> {
  state = {
    name: this.props.macItem.get('name') as string,
    mac: this.props.macItem.get('mac') as string,
    editing: false,
  }

  componentWillReceiveProps(nextProps: MacItemRowProps) {
    if (!is(this.props.macItem, nextProps.macItem)) {
      this.setState({ editing: false })
    }
  }

  onStartEdit = () => this.setState({
    editing: true,
    name: this.props.macItem.get('name') as string,
    mac: this.props.macItem.get('mac') as string,
  })

  onConfirmEdit = () => {
    const { name, mac } = this.state
    if (isValidMac(mac as string)) {
      this.setState({ editing: false })
      this.props.onEdit({ name, mac })
    } else {
      alert('请输入正确的mac')
    }
  }
  onCancelEdit = () => this.setState({ editing: false })

  onChangeName = (e: ChangeEvent) => this.setState({ name: e.target.value })

  onChangeMac = (e: ChangeEvent) => this.setState({ mac: e.target.value })

  render() {
    const { macItem } = this.props
    const { name, mac, editing } = this.state
    if (!editing) {
      return (
        <li className="mac-item">
          <div className="name">{macItem.get('name')}</div>
          <div className="mac">{macItem.get('mac')}</div>
          <button className="button edit" onClick={this.onStartEdit}>edit</button>
          <button className="button delete" onClick={() => this.props.onDelete()}>delete</button>
        </li>
      )
    } else {
      return (
        <li className="mac-item">
          <div className="name">
            <input type="text" value={name} onChange={this.onChangeName} />
          </div>
          <div className="mac">
            <input type="text" value={mac} onChange={this.onChangeMac} />
          </div>
          <button className="button confirm" onClick={this.onConfirmEdit}>confirm</button>
          <button className="button cancel" onClick={this.onCancelEdit}>cancel</button>
        </li>
      )
    }
  }
}

type P = {
  // todo
  staticMacItems: S.StaticMacItems
  onEditMacItem: (id: number, macItem: MacItemRecord) => void
  onDeleteMacItem: (id: number) => void
  onAddMacItem: (name: string, mac: string) => void
}

type S = {
  name: string
  mac: string
}

// eslint-disable-next-line react/no-multi-comp
export default class StaticMacMapping extends Component<P, S> {
  state = {
    name: '',
    mac: '',
  }

  handleAdd = () => {
    const { name, mac } = this.state
    if (isValidMac(mac)) {
      this.props.onAddMacItem(name, mac)
      this.setState({ name: '', mac: '' })
    } else {
      alert('请输入正确的mac地址')
    }
  }

  render() {
    const { staticMacItems, onEditMacItem, onDeleteMacItem } = this.props
    const { name, mac } = this.state

    return (

      <div className="static-mac-mapping">
        <p className="title">静态Mac地址映射表</p>
        {staticMacItems === null ? (
          <div className="empty-mac-item-list">列表暂时为空</div>
        ) : (
            <div>
              <ul className="mac-item-list">
                {staticMacItems.map(macItem => (
                  <MacItemRow
                    key={macItem.id}
                    macItem={macItem}
                    onEdit={editInfo => onEditMacItem(macItem.id, MacItemRecord(editInfo))}
                    onDelete={() => onDeleteMacItem(macItem.id)}
                  />
                )).toArray()}
              </ul>
              <div className="new-mac-item">
                <input
                  style={{ width: 100 }}
                  placeholder="name"
                  type="text"
                  value={name}
                  onChange={e => this.setState({ name: e.target.value })}
                />
                <input
                  style={{ width: 150, marginLeft: 24 }}
                  placeholder="mac"
                  type="text"
                  value={mac}
                  onChange={e => this.setState({ mac: e.target.value })}
                />
                <button onClick={this.handleAdd}>
                  add
              </button>
              </div>
            </div>
          )}
      </div>
    )
  }
}
