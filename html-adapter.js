import { Duplex } from 'streamx'

function match(message, pattern) {
  if (typeof pattern !== 'object' || pattern === null) return false
  for (const key in pattern) {
    if (Object.hasOwn(pattern, key) === false) continue
    if (Object.hasOwn(message, key) === false) return false
    const messageValue = message[key]
    const patternValue = pattern[key]
    const nested =
      typeof patternValue === 'object' &&
      patternValue !== null &&
      typeof messageValue === 'object' &&
      messageValue !== null
    if (nested) {
      if (match(messageValue, patternValue) === false) return false
    } else if (messageValue !== patternValue) {
      return false
    }
  }
  return true
}

class HTMLAdapter extends Duplex {
  constructor(root, tree, opts = {}) {
    super()
    this.root = root
    this.tree = tree
    this.elements = new Map()
    this.patterns = []

    this.when({ type: 'state' }, (data) => {
      this.renderCell(data.source)
    })

    this.render()
  }

  when(pattern, handler) {
    this.patterns.push({ pattern, handler })
    return this
  }

  _write(data, cb) {
    for (const { pattern, handler } of this.patterns) {
      if (match(data, pattern)) {
        handler.call(this, data)
      }
    }
    cb(null)
  }

  _read(cb) {
    cb(null)
  }

  send(msg) {
    this.push(msg)
  }

  render() {
    this.root.innerHTML = ''
    this.renderTree(this.tree, this.root)
  }

  // Get children from cell's internal Bus
  _getChildren(cell) {
    const children = []
    for (const [peer] of cell.children.ports) {
      children.push(peer)
    }
    return children
  }

  renderTree(cell, parent) {
    const el = this.createElement(cell)
    this.elements.set(cell.id, { cell, el })
    parent.appendChild(el)

    const children = this._getChildren(cell)
    for (const child of children) {
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
    const type = cell.type

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
        this.send({ target: cell.id, event: 'click' })
      })
      return btn
    }

    if (type === 'text') {
      const span = document.createElement('span')
      span.id = cell.id
      span.textContent = cell.state.content
      return span
    }

    const div = document.createElement('div')
    div.id = cell.id
    return div
  }

  updateElement(cell, el) {
    const type = cell.type

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

export { HTMLAdapter }
