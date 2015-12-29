const Renderable = require('./Renderable')

module.exports = class Fragment extends Renderable {
  constructor(contents) {
    super()
    this.contents = contents
  }
  render() {
    return this.contents
  }
}