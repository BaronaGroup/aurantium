const jsx = require('./jsx')

const renderer = require('./renderer')
const component = require('./Component')
const fragment = require('./Fragment')
module.exports = {
  renderer: renderer,
  jsx: jsx,
  Component: component,
  Fragment: fragment,
  configure: configure
}

function configure(options) {
  jsx.configure(options)
}