import { configure } from '@storybook/react'

function loadStories() {
  require('../app/stories/index.js');
  require('../app/stories/StaticMacMapping')
  require('../app/stories/TrackMap')
  // You can require as many stories as you need.
}

configure(loadStories, module);
