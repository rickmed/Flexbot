'use strict'

if (process.argv.length < 3) {
  console.log('Pass arguments: user, pw, sessionID')
  process.exit(0)
}

/**
 * Module dependencies
 */
const Sailbot = require('sailbot')
const Async = require('bluebird').coroutine
const DATA = require('../data/data')
const CSS = DATA.cssSelectors
const FRAME = DATA.frames
const FLX_URL = DATA.flexUrl

/*
 * Code
 */
const ID = { id: process.argv[4] }
const go = Sailbot(ID)

/**
 * @param {object} go - flexbot browser
 * @param {string} username
 * @param {string} password
 */
const flexLogin = Async(function* (go, user, pw) {
  go.to(FLX_URL)
  .get(CSS.usuario).clear().write(user)
  .get(CSS.contrasena).clear().write(pw)
  .switchTo('default').get(CSS.login).click()
  .waitFor(CSS.topFrame).isFound()
  yield go.switchTo(FRAME.topFrame).get(CSS.myListings).click('promise')
})

const username = process.argv[2]
const password = process.argv[3]

flexLogin(go, username, password)
