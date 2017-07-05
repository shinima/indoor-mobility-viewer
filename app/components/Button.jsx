import React, { Component } from 'react'

export default class Button extends Component {
  render() {
    const { icon, text, altText, clickEvent } = this.props
    return (
      <div
        style={{
          display: 'flex',
          height: 40,
          alignItems: 'center',
          cursor: 'pointer',
          paddingLeft: 16,
        }}
        onClick={clickEvent}
      >
        <img
          style={{ width: '20px', height: '20px' }}
          src={icon}
          alt={altText}
        />
        <span style={{ marginLeft: 10 }}>{text}</span>
      </div>
    )
  }
}
