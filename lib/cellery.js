const Iambus = require('iambus')
const { Cell } = require('./cells')

class Cellery extends Iambus {
  constructor(app, adapter) {
    super()
    this.app = app
    this.adapter = adapter

    Cell.cellery = this
  }

  // TODO: pipe compat...
  write(data) {
    this.pub(data)
  }
  on(type, cb) {}
  emit(type, stream) {}

  render() {
    this.app.render()
  }
}

module.exports = Cellery
