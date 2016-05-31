//  meteor runtime will overwrite electron's global require function
//  this moves it to be accessible again

window.electronRequire = require('electron').remote.require
delete window.require
delete window.exports
delete window.module
