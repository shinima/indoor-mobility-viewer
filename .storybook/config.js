import { configure } from '@storybook/react'

function loadStories() {
  require('../app/stories/MacList')
  require('../app/stories/StaticMacMapping')
  require('../app/stories/FloorListManager')
  require('../app/stories/TrackMap')
  require('../app/stories/HeatMap')
  require('../app/stories/BrushManager')
  require('../app/stories/ButtonGroup')
  // You can require as many stories as you need.
}

configure(loadStories, module);
