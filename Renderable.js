let renderer = null

var proto = {
  renderHTML(params) {
    if (!renderer) renderer = require('./renderer')
    return renderer.renderObject(this, params)
  }
}
module.exports = function Renderable() {}
module.exports.prototype = proto
