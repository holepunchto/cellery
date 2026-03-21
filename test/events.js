const test = require('brittle')
const { cellery, Cellery, Text } = require('../')

test('basic button', function (t) {
  const el = cellery`<button id="test">Hello</button>`
  const c = new Cellery(el)
  t.plan(7)

  t.ok(el instanceof Text)
  t.is(el.id, 'test')
  t.alike(el.events, ['click'])

  c.sub({}).on('data', (d) => {
    if (d.event === 'register') {
      t.is(d.id, 'test')
      t.alike(d.targets, ['click'])
    }

    if (d.event === 'render') {
      t.is(d.id, 'test')
      t.is(d.content, undefined) // no adapter
    }
  })

  c.render()
})
