const test = require('brittle')
const { cellery, register, App, Text, Paragraph, Container, Cell } = require('../')

test('basic element', function (t) {
  const el = cellery`<App />`
  t.ok(el instanceof App)
  t.is(el.id, 'app')
})

test('nested children', function (t) {
  const el = cellery`<App><Text>hello</Text><Paragraph>world</Paragraph></App>`
  t.is(el.children.length, 2)
  t.ok(el.children[0] instanceof Text)
  t.ok(el.children[1] instanceof Paragraph)
})

test('text children become strings', function (t) {
  const el = cellery`<App><Text>hello</Text></App>`
  const text = el.children[0]
  t.is(text.children.length, 1)
  t.is(text.children[0], 'hello')
})

test('attributes', function (t) {
  const el = cellery`<Input type="password" placeholder="enter" multiline />`
  t.is(el.type, 'password')
  t.is(el.placeholder, 'enter')
  t.is(el.multiline, true)
})

test('numeric attributes', function (t) {
  const el = cellery`<Text size=3>hi</Text>`
  t.is(el.size, 3)
})

test('interpolated attribute values', function (t) {
  const handler = () => {}
  const el = cellery`<Text onclick=${handler}>click me</Text>`
  t.is(el.onclick, handler)
})

test('interpolated text content', function (t) {
  const msg = 'hello world'
  const el = cellery`<Text>${msg}</Text>`
  t.is(el.children[0], 'hello world')
})

test('deeply nested tree', function (t) {
  const el = cellery`<App><Container><Text>deep</Text></Container></App>`
  t.ok(el instanceof App)
  const container = el.children[0]
  t.ok(container instanceof Container)
  const text = container.children[0]
  t.ok(text instanceof Text)
  t.is(text.children[0], 'deep')
})

test('register custom cells', function (t) {
  class Image extends Cell {
    constructor(opts = {}) {
      super(opts)
      this.src = opts.src
    }
  }

  class Caption extends Cell {}

  register({ Image, Caption })

  const src = 'chunli.png'
  const el = cellery`<Image src=${src}><Caption>Chun-Li</Caption></Image>`
  t.ok(el instanceof Image)
  t.is(el.src, 'chunli.png')
  t.ok(el.children[0] instanceof Caption)
  t.is(el.children[0].children[0], 'Chun-Li')
})

test('unknown tag throws', function (t) {
  t.exception(() => cellery`<Bogus />`)
})

test('empty template throws', function (t) {
  t.exception(() => cellery``)
})
