import * as React from 'react'

type Prop = {
  pointType: string
  fill: string
  size?: number
}

export default function TrackPointSymbol({ pointType, fill, size = 20 }: Prop) {
  if (pointType === 'track-start') {
    return (
      <svg className="symbol" viewBox="0 0 1 1" width={size} height={size}>
        <rect x="0" y="0" width="1" height="1" fill={fill} />
      </svg>
    )
  } else if (pointType === 'normal') {
    return (
      <svg className="symbol circle" viewBox="0 0 2 2" width={size} height={size}>
        <circle cx="1" cy="1" r="1" fill={fill} />
      </svg>
    )
  } else if (pointType === 'track-end') {
    return (
      <svg className="symbol" viewBox="0 0 2 2" width={size} height={size}>
        <polygon points="1,0 2,2 0,2" fill={fill} />
      </svg>
    )
  } else if (pointType === 'raw') {
    return (
      <svg className="symbol circle" viewBox="0 0 2 2" width={size} height={size}>
        <circle cx="1" cy="1" r="0.5" fill={fill} />
      </svg>
    )
  } else {
    throw new Error(`Invalid pointType: ${pointType}`)
  }
}

