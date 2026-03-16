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
    this.onclick = opts.onclick
    this.style = opts.style
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

  addScope(target, parent) {
    const parentSelector = parse(parent, { context: 'selector' })

    walk(this.content, {
      visit: 'Rule',
      enter(rule) {
        rule.prelude.children.forEach((selector) => {
          const str = generate(selector)
          if (str !== target) return

          // prepend parent + combinator (descendant space)
          const space = { type: 'Combinator', name: ' ' }

          // walk parentSelector children in reverse so prepend order is correct
          selector.children.prependData(space)
          const items = [...parentSelector.children]
          for (let i = items.length - 1; i >= 0; i--) {
            selector.children.prependData(items[i])
          }
        })
      }
    })
  }
}

class StyleHTML extends Style {
  constructor(opts = {}) {
    super(opts)

    const cellNames = new Set(Object.keys(opts.cells))

    walk(this.content, {
      visit: 'TypeSelector',
      enter(node) {
        if (cellNames.has(node.name)) {
          node.name = `[data-cellery-cell="${node.name}"]`
        }
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

class App extends Cell {
  constructor(opts = {}) {
    super({ ...opts, id: 'app' })
  }
}

class Text extends Cell {
  constructor(opts = {}) {
    super(opts)
    this.value = opts.value || this.children.filter((c) => typeof c === 'string').join('') || ''
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
  Input,

  Style,
  StyleHTML
}
