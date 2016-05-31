'use strict'

let Async = require('bluebird').coroutine
let Sailbot = require('sailbot')


let go = Sailbot()

let example1 = Async(function* () {

    go.to('http://google.com')
    .get('#lst-ib').clear().write('wikipedia')

    let titles = yield go.getAll('h3 a')
        .text()
    let links = yield go.getAll('h3 a')
        .attribute('href')

    console.log(titles, links)

    go.quit()
})

example1()
