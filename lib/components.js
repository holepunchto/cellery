const { GrowComponent } = require('./base')

class Center extends GrowComponent {
  constructor(opts = {}) {
    super(opts)

    this.child = opts.child
  }
}

class Container extends GrowComponent {
  static observedAttributes = ['width', 'height']

  constructor(opts = {}) {
    super(opts)
    this.width = opts.width
    this.height = opts.height
    this.alignment = opts.alignment
    this.margin = opts.margin
    this.padding = opts.padding
    this.decoration = opts.decoration
    this.color = opts.color
    this.children = opts.children || []
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log('attributeChangedCallback', name, oldValue, newValue)
  }
}

const TextAlign = {
  Left: 'left',
  Right: 'right',
  Center: 'center'
}

class Text extends GrowComponent {
  constructor(opts = {}) {
    super(opts)

    this.value = opts.value || ''
    this.color = opts.color
    this.textAlign = opts.textAlign
  }
}

class Pressable extends GrowComponent {
  hotkey = null
  #onPress = null

  constructor(opts = {}) {
    super(opts)

    this.child = opts.child
    this.#onPress = opts.onPress
    this.hotkey = opts.hotkey
  }

  async onPress() {
    if (!this.#onPress) return

    await this.#onPress()
  }
}

module.exports = {
  Center,
  Container,
  Pressable,
  Text,
  TextAlign
}
