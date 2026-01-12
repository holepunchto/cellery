const { EventEmitter } = require('events')

const Alignment = {
  Left: 'left',
  Center: 'center',
  Right: 'right'
}

class EdgeInsets {
  left = 0
  top = 0
  right = 0
  bottom = 0

  constructor(left, top, right, bottom) {
    this.left = left
    this.top = top
    this.right = right
    this.bottom = bottom
  }

  static all(value) {
    return new EdgeInsets(value, value, value, value)
  }

  static symmetric({ vertical, horizontal }) {
    return new EdgeInsets(horizontal, vertical, horizontal, vertical)
  }

  static only({ left, right, top, bottom }) {
    return new EdgeInsets(left, top, right, bottom)
  }

  toString() {
    return `EdgeInsets(${Object.entries(this).map(([k, v]) => `${k}: ${v}`)})`
  }
}

class Border {
  width = 0
  color = null

  constructor(opts = {}) {
    this.width = opts.width || 1
    this.color = opts.color
  }

  static all(opts) {
    return new Border(opts)
  }

  toString() {
    return `Border(${Object.entries(this).map(([k, v]) => `${k}: ${v}`)})`
  }
}

class BoxDecoration {
  border = null

  constructor(opts = {}) {
    this.border = opts.border
  }

  toString() {
    return `BoxDecoration(${Object.entries(this).map(([k, v]) => `${k}: ${v}`)})`
  }
}

class Color {
  red = 0
  green = 0
  blue = 0
  alpha = 0

  constructor(red, green, blue, alpha) {
    this.red = red || 0
    this.green = green || 0
    this.blue = blue || 0
    this.alpha = alpha || 1
  }

  toString() {
    return `Color(${Object.entries(this).map(([k, v]) => `${k}: ${v}`)})`
  }

  toRGBA() {
    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`
  }

  toRGB() {
    return `rgba(${this.red}, ${this.green}, ${this.blue})`
  }

  static from(value, alpha) {
    if (typeof value === 'string' && value.startsWith('#')) {
      return this.#fromHex(value, alpha)
    }
    if (typeof value === 'object') {
      const { red, green, blue, alpha } = value
      return new Color(red, green, blue, alpha)
    }
  }

  static #fromHex(hex, alpha = 1) {
    if (typeof hex !== 'string') return null

    hex = hex.trim().replace(/^#/, '').toLowerCase()

    if (hex.length === 3) {
      const r = hex[0] + hex[0]
      const g = hex[1] + hex[1]
      const b = hex[2] + hex[2]
      hex = r + g + b
    }

    if (hex.length !== 6 || !/^[0-9a-f]{6}$/.test(hex)) {
      return null
    }

    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    return new Color(r, g, b, alpha)
  }
}

class HotKey {
  constructor(opts = {}) {
    this.key = opts.key
    this.ctrl = opts.ctrl ?? false
    this.shift = opts.shift ?? false
  }
}

class Cell extends EventEmitter {
  constructor() {
    super()
  }

  setAttribute(key, value) {
    const oldValue = this[key]
    this[key] = value

    if (this.constructor.observedAttributes && this.constructor.observedAttributes.includes(key)) {
      this.attributeChangedCallback(key, oldValue, value)
    }
  }

  connectedCallback() {}
  disconnectedCallback() {}
  adoptedCallback() {}
  attributeChangedCallback(name, oldValue, newValue) {}

  toString() {
    return `${this.constructor.name}(${Object.entries(this)
      .filter(([_, v]) => (Array.isArray(v) ? v.length : v))
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.map((vc) => vc.toString())}]` : v}`)
      .join(', ')})`
  }
}

class Cellery {
  #renderer = null
  #child = null

  constructor(opts = {}) {
    this.#renderer = opts.renderer
    this.#child = opts.child
  }

  update(child) {
    this.#child = child
    return this.#renderer.render(child)
  }

  render() {
    if (!this.#renderer) {
      return this.#child.toString()
    }

    return this.#renderer.render(this.#child)
  }
}

module.exports = {
  Alignment,
  Border,
  BoxDecoration,
  Color,
  EdgeInsets,
  Cell,
  Cellery,
  HotKey
}
