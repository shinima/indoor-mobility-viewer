import * as React from 'react'
import { Component } from 'react'
import '../styles/ButtonGroup.styl'
import { Action, State } from '../reducer'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

interface ButtonGroupProps {
  onResetTransform: () => void
}

class ButtonGroup extends Component<ButtonGroupProps & { dispatch: Dispatch<State> }> {
  fileInput: HTMLInputElement

  onOpenFile = () => {
    this.fileInput.click()
  }

  refFileInput = (node: HTMLInputElement) => (this.fileInput = node)

  onChangeFile = () => {
    const file = this.fileInput.files[0]
    if (file) {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onloadend = () => {
        try {
          const data = JSON.parse(reader.result)
          this.props.dispatch<Action>({
            type: 'CHANGE_DATA_SOURCE',
            data,
          })
        } catch (e) {
          console.error(e)
          window.alert('Failed to parse the input file. Please upload a json file.')
        }
      }
    }
  }

  render() {
    const { onResetTransform } = this.props

    return (
      <div className="button-group-widget">
        <div className="reset-transform-button-wrapper">
          <button className="reset-transform-button" onClick={onResetTransform}>Centralize Map</button>
          <button className="open-file-button" onClick={this.onOpenFile}>Open Tracks</button>
          <input
            ref={this.refFileInput}
            type="file"
            style={{ display: 'none' }}
            onChange={this.onChangeFile}
          />
        </div>
      </div>
    )
  }
}

export default connect<null, null, ButtonGroupProps>(undefined)(ButtonGroup)
