import { Cellary, Cell } from './cellary.js'
import { Container, Button, Text } from './cells.js'
import { HTMLAdapter } from './html-adapter.js'
import { Duplex } from 'streamx'

// JSON Buffer encoding - what a real p2p backend would use
const JsonBufferEncoding = {
  encode: (data) => Buffer.from(JSON.stringify(data), 'utf-8'),
  decode: (data) => JSON.parse(Buffer.from(data).toString())
}

// Mock backend - simulates a p2p pipe that sends/receives buffers
class MockBackend extends Duplex {
  constructor() {
    super()
    this.store = { clickCount: 0 }
  }

  _write(data, cb) {
    // Data arrives as buffer, already decoded by the time it gets here
    console.log('BACKEND received:', data)

    if (data.source === 'btn1' && data.event === 'click') {
      this.store.clickCount++
      console.log('BACKEND: count is', this.store.clickCount)

      // Send response - will be encoded on the way out
      this.push({
        target: 'txt1',
        payload: { content: 'Count: ' + this.store.clickCount }
      })
    }

    cb(null)
  }

  _read(cb) {
    cb(null)
  }
}

// Create cells
const button = new Button({ id: 'btn1', label: 'Click me' })
const text = new Text({ id: 'txt1', content: 'Count: 0' })

// Container with children
const container = new Container({
  id: 'main',
  children: [button, text]
})

// Mock backend (would be pear-pipe in real app)
const backend = new MockBackend()

// Adapter
const adapter = new HTMLAdapter(document.getElementById('app'), container)

// Create the bus and connect everything
const cellary = new Cellary()

cellary.register(container).connect(adapter).connect(backend, { encoding: JsonBufferEncoding })

console.log('Cellary ready')
