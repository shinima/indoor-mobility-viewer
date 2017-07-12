import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { is, Map } from 'immutable'
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
    const { name, mac, editing } = this.state
    this.setState({ editing: false })
    this.props.onEdit(Map({ name, mac }))
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

class StaticMacMapping extends Component {
  state = {
    name: '',
    mac: '',
  }

  render() {
    const { staticMacItems, onEditMacItem, onDeleteMacItem, onAddMacItem } = this.props
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
                placeholder="name"
                type="text"
                value={name}
                onChange={e => this.setState({ name: e.target.value })}
              />
              <input
                placeholder="mac"
                type="text"
                value={mac}
                onChange={e => this.setState({ mac: e.target.value })}
              />
              <button
                style={{ marginLeft: 16 }}
                onClick={() => {
                  onAddMacItem(name, mac)
                  this.setState({ name: '', mac: '' })
                }}>add
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default StaticMacMapping
