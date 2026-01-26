import { Cell } from './cellary.js'

class Container extends Cell {
  constructor(opts = {}) {
    super({ ...opts, type: 'container' })
    this.state = { visible: true }

    if (opts.children) {
      for (const child of opts.children) {
        this.addChild(child)
      }
    }
  }
}

class Button extends Cell {
  constructor(opts = {}) {
    super({ ...opts, type: 'button' })
    this.state = { label: opts.label || 'Button' }

    this.when({ target: this.id, event: 'click' }, function () {
      this.send({
        source: this.id,
        type: 'event',
        event: 'click'
      })
    })
  }
}

class Text extends Cell {
  constructor(opts = {}) {
    super({ ...opts, type: 'text' })
    this.state = { content: opts.content || '' }

    this.when({ target: this.id }, function (data) {
      if (data.payload?.content !== undefined) {
        this.state.content = data.payload.content
      }
    })
  }
}

export { Container, Button, Text }
