import { Duplex } from 'streamx'
import { Matcher } from './lib/match.js'
import Broadcast from './broadcast.js'

class Cell extends Duplex {
  constructor(opts = {}) {
    super()
    this.id = opts.id
    this.children = opts.children || []
    this.state = {}
    this.matcher = new Matcher()
    this.broadcast = new Broadcast()

    this.broadcast.connect(this.matcher)

    for (const c of this.children) {
      this.broadcast.connect(c)
    }
  }

  _write(data, cb) {
    console.log('incoming', data)
    const stateBefore = JSON.stringify(this.state)

    this.matcher.write(data)
    this.broadcast.send(data)

    const stateAfter = JSON.stringify(this.state)
    if (stateBefore !== stateAfter) {
      this.emitState()
    }

    cb(null)
  }

  _read(cb) {
    cb(null)
  }

  emitState() {
    this.push({
      source: this.id,
      type: this.constructor.name.toLowerCase(),
      state: this.state
    })
  }
}

class HTMLAdapter extends Duplex {
  constructor(root, container) {
    super()
    this.root = root
    this.container = container
    this.elements = new Map()

    // Initial render
    this.render()
  }

  _write(data, cb) {
    // Re-render the cell that changed
    if (data.source && data.state) {
      this.renderCell(data.source)
    }
    cb(null)
  }

  _read(cb) {
    cb(null)
  }

  render() {
    this.root.innerHTML = ''
    this.renderTree(this.container, this.root)
  }

  renderTree(cell, parent) {
    const el = this.createElement(cell)
    this.elements.set(cell.id, { cell, el })
    parent.appendChild(el)

    for (const child of cell.children) {
      this.renderTree(child, el)
    }
  }

  renderCell(id) {
    const entry = this.elements.get(id)
    if (!entry) return

    const { cell, el } = entry
    this.updateElement(cell, el)
  }

  createElement(cell) {
    const type = cell.constructor.name.toLowerCase()

    if (type === 'container') {
      const div = document.createElement('div')
      div.id = cell.id
      div.className = 'container'
      div.style.cssText = cell.state.visible ? '' : 'display: none'
      return div
    }

    if (type === 'button') {
      const btn = document.createElement('button')
      btn.id = cell.id
      btn.textContent = cell.state.label
      btn.addEventListener('click', () => {
        this.push({ target: cell.id, event: 'click' })
      })
      return btn
    }

    if (type === 'text') {
      const span = document.createElement('span')
      span.id = cell.id
      span.textContent = cell.state.content
      return span
    }

    // Fallback
    const div = document.createElement('div')
    div.id = cell.id
    return div
  }

  updateElement(cell, el) {
    const type = cell.constructor.name.toLowerCase()

    if (type === 'container') {
      el.style.cssText = cell.state.visible ? '' : 'display: none'
    }

    if (type === 'button') {
      el.textContent = cell.state.label
    }

    if (type === 'text') {
      el.textContent = cell.state.content
    }
  }
}

class Container extends Cell {
  constructor(opts = {}) {
    super(opts)
    this.state = { visible: true }
  }
}

class Button extends Cell {
  constructor(opts = {}) {
    super(opts)
    this.state = {
      label: opts.label || 'Button'
    }

    this.matcher.add({ target: this.id, event: 'click' }, () => {
      this.push({
        source: this.id,
        type: 'event',
        event: 'click'
      })
    })
  }
}

class Text extends Cell {
  constructor(opts = {}) {
    super(opts)
    this.state = {
      content: opts.content || ''
    }

    this.matcher.add({ target: this.id }, (data) => {
      if (data.payload?.content !== undefined) {
        this.state.content = data.payload.content
      }
    })
  }
}

export { Cell, Container, Button, Text, HTMLAdapter }
