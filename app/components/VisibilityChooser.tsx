import * as React from 'react'
import { Component } from 'react'
import { getColor } from '../utils/utils'
import Checkbox from './Checkbox'
import '../styles/VisibilityChooser.styl'

interface P {
  showRawTrack: boolean
  showSemanticTrack: boolean
  onToggleShowRawTrack: () => void
  onToggleShowSemanticTrack: () => void
}

interface RowProps {
  trackName: string
  checked: boolean
  onToggle: () => void
}

const VisibilityRow = ({ trackName, checked, onToggle }: RowProps) => (
  <div className="list-item">
    <button
      className="color"
      style={{ background: `${getColor(trackName)}` }}
    />
    <div className="text">{trackName}</div>
    <Checkbox checked={checked} onChange={onToggle} />
  </div>
)

export default class VisibilityChooser extends Component<P> {
  render() {
    const {
      showRawTrack,
      showSemanticTrack,
      onToggleShowRawTrack,
      onToggleShowSemanticTrack,
    } = this.props
    return (
      <div className="visibility-chooser">
        <div className="title">
          Visibilities
          <button style={{ marginLeft: 8 }}>Open Tracks</button>
        </div>
        <div className="list">
          <VisibilityRow
            trackName="raw"
            checked={showRawTrack}
            onToggle={onToggleShowRawTrack}
          />
          <VisibilityRow
            trackName="semantic"
            checked={showSemanticTrack}
            onToggle={onToggleShowSemanticTrack}
          />
        </div>
      </div>
    )
  }
}
