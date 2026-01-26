import { Readable, Writable, Duplex, Transform, pipeline } from 'streamx'

// A port represents one connection to the Bus
// Each peer gets their own Port with independent backpressure
class Port extends Readable {
  constructor(bus, peer) {
    super()
    this.bus = bus
    this.peer = peer
  }

  _read(cb) {
    cb(null)
  }

  // Called by Bus when broadcasting
  enqueue(data) {
    return this.push(data)
  }

  _predestroy() {
    this.bus._removePort(this)
  }
}

// Collector receives data from a peer and forwards to Bus
class Collector extends Writable {
  constructor(bus, peer) {
    super()
    this.bus = bus
    this.peer = peer
  }

  _write(data, cb) {
    this.bus._broadcast(data, this.peer)
    cb(null)
  }

  _predestroy() {
    this.bus._removeCollector(this)
  }
}

class Bus {
  constructor() {
    this.ports = new Map()
    this.collectors = new Map()
  }

  connect(peer, opts = {}) {
    const port = new Port(this, peer)
    this.ports.set(peer, port)

    const collector = new Collector(this, peer)
    this.collectors.set(peer, collector)

    const encoding = opts.encoding || null

    if (encoding) {
      // Decode data coming from bus to peer
      const decoder = new Transform({
        transform(data, cb) {
          try {
            cb(null, encoding.decode(data))
          } catch (err) {
            cb(err)
          }
        }
      })

      // Encode data going from peer to bus
      const encoder = new Transform({
        transform(data, cb) {
          try {
            cb(null, encoding.encode(data))
          } catch (err) {
            cb(err)
          }
        }
      })

      pipeline(port, decoder, peer, (err) => {
        if (err) console.error('Decode pipeline error:', err)
      })

      pipeline(peer, encoder, collector, (err) => {
        if (err) console.error('Encode pipeline error:', err)
      })
    } else {
      port.pipe(peer)
      peer.pipe(collector)
    }

    return this
  }

  disconnect(peer) {
    const port = this.ports.get(peer)
    const collector = this.collectors.get(peer)

    if (port) {
      port.destroy()
      this.ports.delete(peer)
    }

    if (collector) {
      collector.destroy()
      this.collectors.delete(peer)
    }

    return this
  }

  _removePort(port) {
    for (const [peer, p] of this.ports) {
      if (p === port) {
        this.ports.delete(peer)
        break
      }
    }
  }

  _removeCollector(collector) {
    for (const [peer, c] of this.collectors) {
      if (c === collector) {
        this.collectors.delete(peer)
        break
      }
    }
  }

  _broadcast(data, source) {
    for (const [peer, port] of this.ports) {
      if (peer !== source) {
        port.enqueue(data)
      }
    }
  }

  send(data) {
    for (const [peer, port] of this.ports) {
      port.enqueue(data)
    }
  }
}

// Matcher - receives data, pattern matches, can push responses
class Matcher extends Duplex {
  constructor() {
    super()
    this.patterns = []
  }

  add(pattern, handler) {
    this.patterns.push({ pattern, handler })
    return this
  }

  _write(data, cb) {
    for (const { pattern, handler } of this.patterns) {
      if (this._match(data, pattern)) {
        handler(data)
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

  _match(message, pattern) {
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
        if (this._match(messageValue, patternValue) === false) return false
      } else if (messageValue !== patternValue) {
        return false
      }
    }
    return true
  }
}

// Cell - a Duplex that has a Matcher and can have Children (via internal Bus)
class Cell extends Duplex {
  constructor(opts = {}) {
    super()
    this.id = opts.id
    this.type = opts.type || 'cell'
    this.state = {}

    // Internal matcher for this cell's patterns
    this.matcher = new Matcher()

    // Internal bus for children
    this.children = new Bus()

    // Wire matcher output back through us
    this.matcher.pipe(this._createUpstream())

    // Wire children output back through us
    // Children bus broadcasts to peers, we collect via a listener
    this._childCollector = new Writable({
      write: (data, cb) => {
        this.push(data)
        cb(null)
      }
    })
  }

  // Creates a writable that pushes back out through this cell
  _createUpstream() {
    const self = this
    return new Writable({
      write(data, cb) {
        self.push(data)
        cb(null)
      }
    })
  }

  addChild(child) {
    this.children.connect(child)
    return this
  }

  when(pattern, handler) {
    this.matcher.add(pattern, handler.bind(this))
    return this
  }

  _write(data, cb) {
    const stateBefore = JSON.stringify(this.state)

    // Send to matcher
    this.matcher.write(data)

    // Send to children
    this.children.send(data)

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
      type: 'state',
      cell: this.type,
      state: this.state
    })
  }

  send(msg) {
    this.push(msg)
  }
}

// Cellary - top level Bus that cells register with
class Cellary extends Bus {
  constructor(opts = {}) {
    super()
    this.cells = new Map()
  }

  register(cell) {
    this.cells.set(cell.id, cell)
    this.connect(cell)
    return this
  }

  unregister(cell) {
    this.cells.delete(cell.id)
    this.disconnect(cell)
    return this
  }

  get(id) {
    return this.cells.get(id)
  }
}

export { Bus, Matcher, Cell, Cellary }
