const { GrowComponent } = require('./base')

class Center extends GrowComponent {
  child = null

  constructor(opts = {}) {
    super(opts)
    this.child = opts.child
  }
}

class Container extends GrowComponent {
  static observedAttributes = ['width', 'height']

  width = null
  height = null
  margin = null
  padding = null
  decoration = null
  children = []

  constructor(opts = {}) {
    super(opts)
    this.width = opts.width
    this.height = opts.height
    this.margin = opts.margin
    this.padding = opts.padding
    this.decoration = opts.decoration
    this.children = opts.children || []
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log('attributeChangedCallback', name, oldValue, newValue)
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
  Center,
  Container,
  Text
}
