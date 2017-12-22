import * as React from 'react'
import { Component } from 'react'
import { getColor } from '../utils/utils'
import Checkbox from './Checkbox'
import '../styles/Legend.styl'

interface LegendProps {
  showRawTrack: boolean
  showSemanticTrack: boolean
  showCleanedRawTrack: boolean
  showGroundTruthTrack: boolean
  onToggleShowRawTrack: () => void
  onToggleShowSemanticTrack: () => void
  onToggleShowCleanedRawTrack: () => void
  onToggleShowGroundTruthTrack: () => void
}

interface LegendItemProps {
  color: string
  displayName: string
  useCheckbox?: boolean
  checked?: boolean
  onToggle?: () => void
  shape?: 'circle' | 'rect'
  borderColor?: string
}

const LegendItem = ({ color, useCheckbox = true, checked, onToggle, displayName, shape = 'circle', borderColor }: LegendItemProps) => (
  <div className="list-item">
    <button
      className="color"
      style={{
        background: color,
        border: borderColor ? `1px solid ${borderColor}` : 'none',
        borderRadius: shape === 'rect' ? 0 : '50%',
      }}
    />
    <div className="text">{displayName}</div>
    {useCheckbox ? <Checkbox checked={checked} onChange={onToggle} /> : null}
  </div>
)

export default class Legend extends Component<LegendProps> {
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
      <div className="legend">
        <div className="title">Legend</div>
        <div className="list">
          <LegendItem
            displayName="Ground Truth"
            color={getColor('ground-truth')}
            checked={showGroundTruthTrack}
            onToggle={onToggleShowGroundTruthTrack}
          />
          <LegendItem
            displayName="Raw Data"
            color={getColor('raw')}
            checked={showRawTrack}
            onToggle={onToggleShowRawTrack}
          />
          <LegendItem
            displayName="Cleaned Raw Data"
            color={getColor('cleaned-raw')}
            checked={showCleanedRawTrack}
            onToggle={onToggleShowCleanedRawTrack}
          />
          <LegendItem
            displayName="Mobility Semantics"
            color={getColor('semantic')}
            checked={showSemanticTrack}
            onToggle={onToggleShowSemanticTrack}
            shape="rect"
          />
          <LegendItem
            displayName="Room"
            useCheckbox={false}
            color="#f4f4f4"
            borderColor="#cccccc"
            shape="rect"
          />
          <LegendItem
            displayName="Hallway"
            useCheckbox={false}
            color="#ffffff"
            borderColor="#cccccc"
            shape="rect"
          />
          <LegendItem
            displayName="Staircase"
            useCheckbox={false}
            color="#d4eb8b"
            borderColor="#cccccc"
            shape="rect"
          />
          <div className="list-item">
            <button
              className="color"
              style={{
                background: "#a2a1a1",
                transform: 'scaleY(0.4)',
              }}
            />
            <div className="text">Door</div>
          </div>
          <div className="list-item">
            <svg width="16" height="16" className="color">
              <circle fill="#3078b3" cx="8" cy="8" r="8" />
              <line
                x1="3.34314"
                y1="3.34314"
                x2="12.65686"
                y2="12.65686"
                stroke="#f8f9fd"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="3.34314"
                y1="12.65686"
                x2="12.65686"
                y2="3.34314"
                stroke="#f8f9fd"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="text">False Floor Values</div>
          </div>
        </div>
      </div>
    )
  }
}
