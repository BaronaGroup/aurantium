const Renderable = require('./Renderable'),
  _ = require('lodash')


const proto = _.extend(new Renderable(), {

  render() {
    return this.contents
  }
})


module.exports = function(contents) { this.contents = contents}
module.exports.prototype = proto
