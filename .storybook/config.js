import { configure } from '@storybook/react'

function loadStories() {
  require('../app/stories/MacList')
  require('../app/stories/StaticMacMapping')
  require('../app/stories/FloorListManager')
  require('../app/stories/TrackMap')
  // You can require as many stories as you need.
}

configure(loadStories, module);
