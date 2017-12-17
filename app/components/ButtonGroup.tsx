import * as React from 'react'
import { Component } from 'react'
import '../styles/ButtonGroup.styl'

interface P {
  onResetTransform: () => void
}

export default class ButtonGroup extends Component<P> {
  handle = -1

  componentDidMount() {
    this.handle = setInterval(() => {
      this.setState({})
    }, 1000) as any
  }

  componentWillUnmount() {
    clearInterval(this.handle)
  }

  render() {
    const { onResetTransform } = this.props

    return (
      <div className="button-group-widget">
        <div className="reset-transform-button-wrapper">
          <button
            className="reset-transform-button"
            onClick={onResetTransform}
          >
            Centralize Map
          </button>
        </div>
      </div>
    )
  }
}
