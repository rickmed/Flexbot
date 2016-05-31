import '/imports/api/flexbot/collections.js'
import '/imports/api/flexbot/methods.js'
var Nightmare = require('nightmare-meteor')

console.log('Starting Server...')

const linux = process.platform === 'linux'

let xvfb

if (linux) {

  const Xvfb = require('xvfb')
  xvfb = new Xvfb({ reuse: true })

  xvfb.start(function (err) {

    if (err) console.log('xvfb could not be started: ', err)

    else {
      console.log('xvfb started. Starting Nightmare...')
      runNightmare()
    }

  })
}

else {
  console.log('Starting Nightmare...')
  runNightmare()
}

async function runNightmare () {

  const user = process.env.FLX_USER
  const pw = process.env.FLX_PW

  try {
    var nightmare = Nightmare({ show: false })

    const listingsMetaIds = await nightmare
      .on('console', function (method, message) {
        console[method](message)
      })
      .goto('http://ven.flexmls.com')
      .type('#user', user)
      .type('#password', pw)
      .click('#login-button')
      .enterIframe('#top_frame')
      .click('a[name=my_listings]')
      .enterIframe(['#top_frame', '#view_frame'])
      .wait('#thegridbody .listing')
      .end()
      .getAll('#thegridbody .listing').attribute('id')

    console.log(listingsMetaIds)
    console.log('listingsMetaIds found: ', listingsMetaIds.length)

    if (linux) {
      xvfb.stop( function (err) {
        if (err) console.log('xvfb could not be stopped: ', err)
        else console.log('xvfb stopped')
      })
    }
  }

  catch (err) {
    console.error(err)
  }

}
