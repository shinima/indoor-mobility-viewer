import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import TimeBrush from '../components/TimeBrush'


storiesOf('BrushManager', module)
  .add('timeBrush', () => <TimeBrush />)
