import React from 'react'

export default function TrackPointSymbol({ pointType, fill }) {
  if (pointType === 'track-start') {
    return (
      <svg className="symbol" viewBox="0 0 1 1">
        <rect x="0" y="0" width="1" height="1" fill={fill} />
      </svg>
    )
  } else if (pointType === 'normal') {
    return (
      <svg className="symbol circle" viewBox="0 0 2 2">
        <circle cx="1" cy="1" r="1" fill={fill} />
      </svg>
    )
  } else if (pointType === 'track-end') {
    return (
      <svg className="symbol" viewBox="0 0 2 2">
        <polygon points="1,0 2,2 0,2" fill={fill} />
      </svg>
    )
  } else {
    throw new Error(`Invalid pointType: ${pointType}`)
  }
}

