import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import { Meteor } from 'meteor/meteor'

Meteor.startup( () => {
  ReactDOM.render(<App/>, document.getElementById('react-root'))
})
