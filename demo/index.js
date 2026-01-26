/** @typedef {import('pear-interface')} */
import Runtime from 'pear-electron'
import Bridge from 'pear-bridge'
import updates from 'pear-updates'
import { Matcher } from './ui/lib/match.js'
import Broadcast from './ui/broadcast.js'
import { JsonBufferEncoding } from './ui/lib/encoding.js'

updates((update) => {
  console.log('Application update available:', update)
})

const bridge = new Bridge({ mount: '/ui', waypoint: 'index.html' })
await bridge.ready()

const runtime = new Runtime()
const pipe = await runtime.start({ bridge })
pipe.on('close', () => Pear.exit())

const matcher = new Matcher()
let clickCount = 0

matcher.add({ source: 'btn1', event: 'click' }, () => {
  console.log('match')
  clickCount++
  bus.send({
    target: 'txt1',
    payload: { content: 'Count: ' + clickCount }
  })
})

pipe.on('data', (data) => {
  const msg = JSON.parse(Buffer.from(data).toString())
  console.log('PIPE DATA', msg)
})

const bus = new Broadcast()
bus.connect(pipe, { encoding: JsonBufferEncoding })
bus.connect(matcher)
