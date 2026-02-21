class Alignment {
  direction = ''
  justify = ''
  items = ''

  constructor(direction, justify, items) {
    this.direction = direction
    this.justify = justify
    this.items = items
  }

  static Horizontal({ justify, items }) {
    return new Alignment('horizontal', justify, items)
  }

  static Vertical({ justify, items }) {
    return new Alignment('vertical', justify, items)
  }
}

class Spacing {
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
    return new Spacing(value, value, value, value)
  }

  static symmetric({ vertical, horizontal }) {
    return new Spacing(horizontal, vertical, horizontal, vertical)
  }

  static only({ left, right, top, bottom }) {
    return new Spacing(left, top, right, bottom)
  }

  toString() {
    return `Spacing(${Object.entries(this).map(([k, v]) => `${k}: ${v}`)})`
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

  // todo: support trlb

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

const Size = {
  XS: 'xs',
  S: 's',
  M: 'm',
  L: 'l',
  XL: 'xl'
}

module.exports = {
  Alignment,
  BoxDecoration,
  Border,
  Color,
  Spacing,
  Size
}
