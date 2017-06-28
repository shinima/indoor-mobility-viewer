import { configure } from '@storybook/react'

function loadStories() {
  require('../app/stories/MacListManager')
  require('../app/stories/StaticMacMapping')
  require('../app/stories/TrackMap')
  require('../app/stories/FloorListManager')
  // You can require as many stories as you need.
}

configure(loadStories, module);
