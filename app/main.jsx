import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader'
import './preloaded'
import App from './components/App'
import store from './store'
import './styles/global.styl'

function render(Component) {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>
    , document.getElementById('container'),
  )
}

// render
render(App)

// enable hot-reload
if (module.hot) {
  module.hot.accept('./components/App.jsx', () => {
    // eslint-disable-next-line global-require
    render(require('./components/App.jsx').default)
  })
}
