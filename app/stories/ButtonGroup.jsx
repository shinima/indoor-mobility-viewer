import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import ButtonGroup from '../components/ButtonGroup'

storiesOf('ButtonGroup', module)
  .add('static', () => (
    <ButtonGroup
      onResetTransform={action('reset-transform')}
      showPath
      onToggleShowPath={action('toggle-path')}
      onToggleShowPoints={action('toggle-points')}
      history={{ push: action('history-push') }}
    />
  ))
