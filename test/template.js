const test = require('brittle')
const { cellery, register, Fragment, Text, Container, Cell } = require('../')

test('basic element', function (t) {
  const el = cellery`<Text id='test'/>`
  t.ok(el instanceof Text)
  t.is(el.id, 'test')
})

test('nested children', function (t) {
  const el = cellery`<><Text>hello</Text><Text paragraph>world</Text></>`
  t.is(el.children.length, 2)
  t.ok(el.children[0] instanceof Text)
  t.ok(el.children[1] instanceof Text)
  t.is(el.children[1].paragraph, true)
})

test('text children become strings', function (t) {
  const el = cellery`<><Text>hello</Text></>`
  const text = el.children[0]
  t.is(text.children.length, 1)
  t.is(text.children[0], 'hello')
  t.is(text.value, 'hello')
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
  const heading = 1
  const el = cellery`<Text heading=${heading}>click me</Text>`
  t.alike(el.heading, 1)
})

test('interpolated text content', function (t) {
  const msg = 'hello world'
  const el = cellery`<Text>${msg}</Text>`
  t.is(el.children[0], 'hello world')
  t.is(el.value, 'hello world')
})

test('deeply nested tree', function (t) {
  const el = cellery`<><Container><Text>deep</Text></Container></>`
  t.ok(el instanceof Fragment)
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

test('styles', function (t) {
  const msg = 'hello world'
  const el = cellery`<Container>
    <Style>
      Text {
      color: red;
      }
   </Style>
    <Text>${msg}</Text>
    </Container>`

  const text = el.children[0]
  t.is(text.children[0], 'hello world')
  t.is(text.value, 'hello world')
  console.log(el.style.content.children.first)

  // html style converts cells to classes
  t.is(el.style.findProperty('[data-cellery-cell="Text"]', 'color'), 'red')
  t.is(el.style.toCSS(), '[data-cellery-cell="Text"]{color:red}')
})

test('styles - add scope', function (t) {
  const msg = 'hello world'
  const el = cellery`<Container>
    <Style>
      Text {
      color: red;
      }
   </Style>
    <Text>${msg}</Text>
    </Container>`

  const text = el.children[0]
  t.is(text.children[0], 'hello world')
  t.is(text.value, 'hello world')
  console.log(el.style.content.children.first)

  // html style converts cells to classes
  t.is(el.style.findPropertyOfCell('Text', 'color'), 'red')
  el.style.addScope('[data-cellery-cell="Text"]', 'parent')
  t.is(el.style.toCSS(), '[data-cellery-cell="Text"]#parent{color:red}')
  t.is(el.style.findProperty('[data-cellery-cell="Text"]#parent', 'color'), 'red')
})

test('mixed interpolation in text content', function (t) {
  const name = 'myrepo'
  const el = cellery`<Text>Container#${name} { color: red; }</Text>`
  t.is(el.value, 'Container#myrepo { color: red; }')
})

test('multiple interpolations in text content', function (t) {
  const a = 'foo'
  const b = 'bar'
  const el = cellery`<Text>#${a} { } .${b}:hover { }</Text>`
  t.is(el.value, '#foo { } .bar:hover { }')
})

test('dotted tag names', function (t) {
  class StyleHTML extends Cell {}
  register({ 'Style.HTML': StyleHTML })
  const name = 'myrepo'
  const el = cellery`<Style.HTML>Container#${name} { color: red; }</Style.HTML>`
  t.ok(el instanceof StyleHTML)
  t.is(el.children[0], 'Container#myrepo { color: red; }')
})

test('mixed interpolation in quoted attributes', function (t) {
  const name = 'myrepo'
  const el = cellery`<Container id="item-${name}" />`
  t.is(el.id, 'item-myrepo')
})

test('compat', function (t) {
  const el = cellery`<><span>hello</span><p>world</p></>`
  t.is(el.children.length, 2)
  t.ok(el.children[0] instanceof Text)
  t.ok(el.children[1] instanceof Text)
  t.is(el.children[1].paragraph, true)
})

test('compat - style', function (t) {
  const el = cellery`<>
    <style>
     span {
       color:red;
     }
    </style>
    <div>
      <span>hello</span>
    </div>
    <p>world</p>
    </>`
  t.is(el.children.length, 2)
  t.ok(el.children[0] instanceof Container)
  t.ok(el.children[0].children[0] instanceof Text)
  t.ok(el.children[1] instanceof Text)
  t.is(el.children[1].paragraph, true)
})
