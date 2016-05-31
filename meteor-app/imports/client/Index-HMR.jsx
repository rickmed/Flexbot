import 'react-hot-loader/patch'
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './App.jsx'

const renderApp = (AppEntry) => {
  ReactDOM.render(
    <AppContainer>
      <AppEntry/>
    </AppContainer>,
    document.getElementById('react-root')
  )
}

renderApp(App)

if (module.hot) {
  module.hot.accept('./App.jsx', () => {
    const NextAppRoot = require('./App.jsx').default
    renderApp(NextAppRoot)
    console.log('Hot updates enabled')
  })
}
