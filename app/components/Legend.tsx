import * as React from 'react'
import { Component } from 'react'
import { getColor } from '../utils/utils'
import Checkbox from './Checkbox'
import '../styles/VisibilityChooser.styl'

interface P {
  showRawTrack: boolean
  showSemanticTrack: boolean
  showCleanedRawTrack: boolean
  showGroundTruthTrack: boolean
  onToggleShowRawTrack: () => void
  onToggleShowSemanticTrack: () => void
  onToggleShowCleanedRawTrack: () => void
  onToggleShowGroundTruthTrack: () => void
}

interface RowProps {
  trackName: string
  show: boolean
  onToggle: () => void
}

const VisibilityRow = ({ trackName, show, onToggle }: RowProps) => (
  <div className="list-item">
    <button
      className="color"
      style={{ background: `${getColor(trackName)}` }}
    />
    <div className="text">{trackName}</div>
    <Checkbox checked={show} onChange={onToggle} />
  </div>
)

export default class Legend extends Component<P> {
  render() {
    const {
      showRawTrack,
      showSemanticTrack,
      showCleanedRawTrack,
      showGroundTruthTrack,
      onToggleShowGroundTruthTrack,
      onToggleShowRawTrack,
      onToggleShowCleanedRawTrack,
      onToggleShowSemanticTrack,
    } = this.props
    /* TODO 需要支持打开不同的文件 */
    return (
      <div className="visibility-chooser">
        <div className="title">
          Visibilities
          <button style={{ marginLeft: 8 }}>Open Tracks</button>
        </div>
        <div className="list">
          <VisibilityRow
            trackName="ground-truth"
            show={showGroundTruthTrack}
            onToggle={onToggleShowGroundTruthTrack}
          />
          <VisibilityRow
            trackName="raw"
            show={showRawTrack}
            onToggle={onToggleShowRawTrack}
          />
          <VisibilityRow
            trackName="cleaned-raw"
            show={showCleanedRawTrack}
            onToggle={onToggleShowCleanedRawTrack}
          />
          <VisibilityRow
            trackName="semantic"
            show={showSemanticTrack}
            onToggle={onToggleShowSemanticTrack}
          />
        </div>
      </div>
    )
  }
}
