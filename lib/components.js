const { GrowComponent } = require('./base')

class Container extends GrowComponent {
  static observedAttributes = ['width', 'height']

  width = null
  height = null
  margin = null
  padding = null
  decoration = null

  constructor(opts = {}) {
    super(opts)
    this.width = opts.width
    this.height = opts.height
    this.margin = opts.margin
    this.padding = opts.padding
    this.decoration = opts.decoration
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attributeChangedCallback', name, oldValue, newValue)
  }
}

class Text extends GrowComponent {
  value = ''
  color = null

  constructor(opts = {}) {
    super(opts)
    this.value = opts.value
    this.color = opts.color
  }
}

module.exports = {
  Container,
  Text
}
