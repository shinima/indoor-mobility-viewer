import * as React from 'react'

const noop = () => noop

interface P {
  width?: number
  height?: number
  checked: boolean
  onChange?: (checked: boolean) => void
}

export default class Checkbox extends React.PureComponent<P> {
  onClick = () => {
    const { onChange = noop, checked } = this.props
    onChange(!checked)
  }

  render() {
    const { width = 16, height = 16, checked } = this.props
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 16 16"
        onClick={this.onClick}
      >
        <rect
          fill={checked ? '#1881DC' : '#cccccc'}
          x="0"
          y="0"
          width="16"
          height="16"
          rx="2"
        />
        {checked ?
          <path
            d="M11.6915897,5.28979659 C11.280376,4.90340114 10.6146515,4.90340114 10.2044894,5.28979659 L6.66657903,8.61418101 L5.79472179,7.79593181 C5.38455977,7.40953636 4.71883525,7.40953636 4.30762152,7.79593181 C3.89745949,8.18133904 3.89745949,8.80688462 4.30762152,9.19328008 L5.92302889,10.7102034 C6.33319092,11.0965989 6.99891544,11.0965989 7.41012916,10.7102034 L11.6915897,6.68714486 C12.1028034,6.30173763 12.1028034,5.67619204 11.6915897,5.28979659"
            fill="#FFFFFF"
          />
          : null}
      </svg>
    )
  }
}
