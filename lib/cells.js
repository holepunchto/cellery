const { parse, walk, generate } = require('css-tree/dist/csstree.esm')

class Cell {
  constructor(opts = {}) {
    this.id = opts.id
    this.children = opts.children || []
    this.cellery = opts.cellery || Cell.cellery
    this.padding = opts.padding
    this.margin = opts.margin
    this.color = opts.color
    this.alignment = opts.alignment
    this.decoration = opts.decoration
    this.size = opts.size
    this.events = opts.events
    this.style = opts.style

    this._eventsRegistered = false
  }

  static Styled(styledOpts = {}) {
    const Parent = this
    return class extends Parent {
      constructor(opts = {}) {
        super({ ...styledOpts, ...opts })
      }

      get parent() {
        return Parent.name
      }
    }
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

    if (!this.cellery) {
      this.cellery = Cell.cellery
    }

    // @todo explore - 'ready' style first time setup?
    if (this.events?.length && this.id && !this._eventsRegistered) {
      this._eventsRegistered = true
      this.cellery.pub({ event: 'register', id: this.id, targets: this.events })
    }

    this.cellery.pub({
      event: 'render',
      id: cell.id,
      content: this.cellery.adapter?.render(cell),
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
}

class Style {
  constructor(opts = {}) {
    this.content = parse(opts.children?.join('\n'))
  }

  findPropertyOfCell(name, property) {
    return this.findProperty(`[data-cellery-cell="${name}"]`, property)
  }

  findProperty(selector, property) {
    let value = null

    walk(this.content, {
      visit: 'Rule',
      enter(rule) {
        const prelude = generate(rule.prelude)
        if (prelude !== selector) return

        rule.block.children.forEach((decl) => {
          if (decl.type === 'Declaration' && decl.property === property) {
            value = generate(decl.value)
          }
        })
      }
    })

    return value
  }

  addScope(parent) {
    walk(this.content, {
      visit: 'Rule',
      enter(rule) {
        rule.prelude.children.forEach((selector) => {
          selector.children.prependData({ type: 'Combinator', name: ' ' })
          selector.children.prependData({ type: 'IdSelector', name: parent })
        })
      }
    })
  }

  toCSS() {
    return generate(this.content)
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

class Fragment extends Cell {
  constructor(opts = {}) {
    super({ ...opts })
  }
}

class Text extends Cell {
  constructor(opts = {}) {
    super(opts)
    this.value = opts.value || this.children.filter((c) => typeof c === 'string').join('') || ''
    this.paragraph = !!opts.paragraph
    this.heading = opts.heading
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
  Fragment,
  Text,
  Input,
  Style
}
