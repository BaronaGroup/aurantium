let renderer = null

module.exports = class Renderable {
  renderHTML(params) {
    if (!renderer) renderer = require('./renderer')
    return renderer.renderObject(this, params)
  }
}