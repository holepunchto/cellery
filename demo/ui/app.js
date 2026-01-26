/** @typedef {import('pear-interface')} */ /* global Pear */
import updates from 'pear-updates'
import restart from 'pear-restart'
import { Container, Button, Text, HTMLAdapter } from './ui.js'
import pipe from 'pear-pipe'
import Broadcast from './broadcast.js'
import { JsonBufferEncoding } from './lib/encoding.js'

updates({ updated: true }, (update) => {
  console.log('update available:', update)
  document.getElementById('update').style.display = 'revert'
  const action = document.getElementById('action')
  action.style.display = 'revert'
  action.onclick = () => {
    restart({ platform: !update.app })
  }
  action.innerText =
    'Restart ' +
    (update.app ? 'App' : 'Pear') +
    ' [' +
    update.version.fork +
    '.' +
    update.version.length +
    ']'
})

const container = new Container({
  id: 'main',
  children: [
    new Button({ id: 'btn1', label: 'Click me' }),
    new Text({ id: 'txt1', content: 'Count: 0' })
  ]
})

const adapter = new HTMLAdapter(document.getElementById('app'), container)

const broadcast = new Broadcast()
broadcast.connect(pipe(), { encoding: JsonBufferEncoding })
broadcast.connect(adapter)
broadcast.connect(container)
