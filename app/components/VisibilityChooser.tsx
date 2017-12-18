import * as React from 'react'
import { Component } from 'react'
import { getColor } from '../utils/utils'
import Checkbox from './Checkbox'
import { TrackName } from '../interfaces'
import '../styles/VisibilityChooser.styl'

interface P {
  baseTrackName: TrackName
  showRawTrack: boolean
  showSemanticTrack: boolean
  onToggleShowRawTrack: () => void
  onToggleShowSemanticTrack: () => void
  onChangeBaseTrackName: (nextBaseTrackName: TrackName) => void
}

interface RowProps {
  trackName: string
  show: boolean
  checked: boolean
  onToggle: () => void
  onChange: () => void
}

const VisibilityRow = ({ trackName, show, checked, onToggle, onChange }: RowProps) => (
  <div className="list-item">
    <button
      className="color"
      style={{ background: `${getColor(trackName)}` }}
    />
    <div className="text">{trackName}</div>
    <input type="radio" checked={checked} onChange={onChange} />
    <Checkbox checked={show} onChange={onToggle} />
  </div>
)

export default class VisibilityChooser extends Component<P> {
  render() {
    const {
      baseTrackName,
      showRawTrack,
      showSemanticTrack,
      onToggleShowRawTrack,
      onToggleShowSemanticTrack,
      onChangeBaseTrackName,
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
            show={showRawTrack}
            onToggle={onToggleShowRawTrack}
            checked={baseTrackName === 'raw'}
            onChange={() => onChangeBaseTrackName('raw')}
          />
          <VisibilityRow
            trackName="semantic"
            show={showSemanticTrack}
            onToggle={onToggleShowSemanticTrack}
            checked={baseTrackName === 'semantic'}
            onChange={() => onChangeBaseTrackName('semantic')}
          />
        </div>
      </div>
    )
  }
}
