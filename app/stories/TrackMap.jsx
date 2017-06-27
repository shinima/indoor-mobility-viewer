import React from 'react'
import { storiesOf } from '@storybook/react'
import TrackMap from '../components/Map/TrackMap'
import '../styles/global.styl'

storiesOf('TrackMap', module)
  .add('static', () => (
    <TrackMap />
  ))
