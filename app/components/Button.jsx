import React, { Component } from 'react'

export default class Button extends Component {
  render() {
    const { icon, text, altText, onClick } = this.props
    return (
      <div
        style={{
          display: 'flex',
          height: 40,
          alignItems: 'center',
          cursor: 'pointer',
          paddingLeft: 16,
          userSelect: 'none',
        }}
        onClick={onClick}
      >
        <img
          style={{ width: '20px', height: '20px' }}
          src={icon}
          alt={altText}
        />
        <div style={{ marginLeft: 10, marginBottom: 2 }}>{text}</div>
      </div>
    )
  }
}
