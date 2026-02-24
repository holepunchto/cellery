class Cell {
  constructor(opts = {}) {
    this.id = opts.id
    this.children = opts.children || []
    this.cellery = opts.cellery
    this.padding = opts.padding
    this.margin = opts.margin
    this.color = opts.color
    this.alignment = opts.alignment
    this.decoration = opts.decoration
    this.size = opts.size
  }

  sub(pattern, cb) {
    this.cellery.sub(pattern).on('data', (d) => cb(this, d))
  }

  _render() {
    // impl
    return this
  }

  render(opts = {}) {
    const cell = this._render()
    if (!cell.cellery) {
      cell.register(this.cellery)
    }

    this.cellery.pub({
      event: 'render',
      id: cell.id,
      content: this.cellery.adapter.render(cell),
      ...opts
    })
  }

  destroy() {
    this.cellery.pub({
      event: 'render',
      id: this.id,
      destroy: true
    })
  }

  register(cellery) {
    this.cellery = cellery
    for (const c of this.children) {
      c.register(cellery)
    }
  }
}

class Container extends Cell {
  // TODO: replace with classes
  static ScrollAll = 'all'
  static ScrollVertical = 'vertical'
  static ScrollHorizontal = 'horizontal'
  static ScrollNone = 'none'
  static FlexAuto = 'auto'
  static FlexNone = 'none'

  constructor(opts = {}) {
    super(opts)
    this.scroll = opts.scroll || Container.ScrollNone
    this.flex = opts.flex || Container.FlexNone
  }
}

class App extends Cell {
  constructor(opts = {}) {
    super({ ...opts, id: 'app' })
  }
}

class Text extends Cell {
  constructor(opts = {}) {
    super(opts)
    this.value = opts.value || ''
  }
}

class Paragraph extends Cell {
  constructor(opts = {}) {
    super(opts)
  }
}

class Input extends Cell {
  constructor(opts = {}) {
    super(opts)
    this.multiline = !!opts.multiline
    this.placeholder = opts.placeholder
    this.type = opts.type || 'text'
  }
}

module.exports = {
  Cell,
  Container,
  App,
  Text,
  Paragraph,
  Input
}
