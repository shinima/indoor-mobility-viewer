import * as React from 'react'
import { Component } from 'react'

type P = {
  icon: string
  text: string
  altText: string
  onClick?: () => void
  style?: React.CSSProperties
}

export default class Button extends Component<P> {
  render() {
    const { icon, text, altText, onClick, style = {} } = this.props
    return (
      <div
        style={Object.assign({
          display: 'flex',
          height: 40,
          alignItems: 'center',
          cursor: 'pointer',
          paddingLeft: 16,
          userSelect: 'none',
        }, style)}
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
