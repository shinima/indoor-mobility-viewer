import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { is, Map } from 'immutable'
import '../styles/StaticMacMapping.styl'

class MacItemRow extends Component {
  static propTypes = {
    macItem: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
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
    this.props.onEdit(Map({ name, mac }))
  }
  onCancelEdit = () => this.setState({ editing: false })

  onChangeName = e => this.setState({ name: e.target.value })

  onChangeMac = e => this.setState({ mac: e.target.value })

  render() {
    const { macItem, index } = this.props
    const { name, mac, editing } = this.state
    if (!editing) {
      return (
        <li className="mac-item">
          <div className="index">{index}</div>
          <div className="name">{macItem.get('name')}</div>
          <div className="mac">{macItem.get('mac')}</div>
          <button className="button edit" onClick={this.onStartEdit}>edit</button>
          <button className="button delete" onClick={() => this.props.onDelete()}>delete</button>
        </li>
      )
    } else {
      return (
        <li className="mac-item">
          <div className="index">{index}</div>
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

const StaticMacMapping = ({ staticMacItems, onEditMacItem, onDeleteMacItem }) => (
  <div className="static-mac-mapping">
    <p className="title">静态Mac地址映射表</p>
    {staticMacItems.isEmpty() ? (
      <div className="empty-mac-item-list">列表暂时为空</div>
    ) : (
      <ul className="mac-item-list">
        {staticMacItems.map((macItem, index) => (
          <MacItemRow
            key={macItem.get('id')}
            index={index}
            macItem={macItem}
            onEdit={newMacItem => onEditMacItem(macItem.get('id'), newMacItem)}
            onDelete={() => onDeleteMacItem(macItem.get('id'))}
          />
        )).toArray()}
      </ul>
    )}
  </div>
)

export default StaticMacMapping
