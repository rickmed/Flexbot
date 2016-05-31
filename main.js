'use strict'

/**
 * Module dependencies
 */
const updateFlexBs = require('./app/flexbot')
const FILE = __dirname + '/resources/publicaciones.xlsx'


const opt = {timeout: 60}

console.log('Pass the sessionID to attach to an opened browser')

const args = process.argv

if (args.length > 2) {
  Object.assign(opt, { id: args[2] })
}

updateFlexBs(FILE, opt)
