const settings = Meteor.settings.public

if (settings.hmr === 'no') {
  require('/imports/client/Index.jsx')
}
else {
  require('/imports/client/Index-HMR.jsx')
}
