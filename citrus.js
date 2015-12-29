const jsx = require('./jsx')

module.exports = {
  renderer: require('./renderer'),
  jsx: jsx,
  Component: require('./Component'),
  Fragment: require('./Fragment'),
  configure: configure
}

function configure(options) {
  jsx.configure(options)
}