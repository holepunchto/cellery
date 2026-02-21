const Iambus = require('iambus')

class Cellery extends Iambus {
  constructor(app, adapter) {
    super()
    this.app = app
    this.adapter = adapter

    this.app.register(this)
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
