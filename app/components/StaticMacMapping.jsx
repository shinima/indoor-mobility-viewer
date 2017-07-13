import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { is, Map } from 'immutable'
import { isValidMac } from '../utils/utils'
import '../styles/StaticMacMapping.styl'

class MacItemRow extends Component {
  static propTypes = {
    macItem: PropTypes.object.isRequired,
  }

  state = {
    name: this.props.macItem.get('name'),
    mac: this.props.macItem.get('mac'),
    editing: false,
  }

  componentWillReceiveProps(nextProps) {
    if (!is(this.props.macItem, nextProps.macItem)) {
      this.setState({ editing: false })
    }
  }

  onStartEdit = () => this.setState({
    editing: true,
    name: this.props.macItem.get('name'),
    mac: this.props.macItem.get('mac'),
  })

  onConfirmEdit = () => {
    const { name, mac } = this.state
    if (isValidMac(mac)) {
      this.setState({ editing: false })
      this.props.onEdit(Map({ name, mac }))
    } else {
      alert('请输入正确的mac')
    }
  }
  onCancelEdit = () => this.setState({ editing: false })

  onChangeName = e => this.setState({ name: e.target.value })

  onChangeMac = e => this.setState({ mac: e.target.value })

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

// eslint-disable-next-line react/no-multi-comp
class StaticMacMapping extends Component {
  static propTypes = {
    staticMacItems: PropTypes.object.isRequired,
    onEditMacItem: PropTypes.func.isRequired,
    onDeleteMacItem: PropTypes.func.isRequired,
    onAddMacItem: PropTypes.func.isRequired,
  }
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
                  key={macItem.get('id')}
                  macItem={macItem}
                  onEdit={newMacItem => onEditMacItem(macItem.get('id'), newMacItem)}
                  onDelete={() => onDeleteMacItem(macItem.get('id'))}
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

export default StaticMacMapping
