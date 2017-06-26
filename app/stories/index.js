import React from 'react';
import { storiesOf } from '@storybook/react';
import Test from '../components/test'
import MacListManager from '../components/MacListManager'

storiesOf('Button', module)
  .add('test', () => <Test />)
  .add('MacListManager', () => <MacListManager />)
