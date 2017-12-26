import * as React from 'react'
import { ComponentClass } from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader'
import App from './components/TrackMapPage'
import store from './store'
import './styles/global.styl'

function render(Component: ComponentClass) {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('container'),
  )
}

// render
render(App)

declare global {
  interface NodeModule {
    hot: any
  }
}

// enable hot-reload
if (module.hot) {
  module.hot.accept('./components/TrackMapPage.tsx', () => {
    // eslint-disable-next-line global-require
    render(require('./components/TrackMapPage').default)
  })
}
