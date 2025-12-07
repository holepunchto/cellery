const { EdgeInsets, Color, Grow, BoxDecoration, Border } = require('./lib/base')
const { Container, Text } = require('./lib/components')
const { GrowRendererTUI } = require('./lib/tui-renderer')

const ui = new Container({
  width: 200,
  height: 100,
  margin: EdgeInsets.all(5),
  decoration: new BoxDecoration({
    border: Border.all()
  }),
  children: [
    new Text({
      value: 'Hello world!',
      color: Color.from({ red: 255 })
    }),
    new Text({
      value: 'Hello again!',
      color: Color.from({ blue: 255 })
    })
  ]
})

ui.setAttribute('width', 250)

const grow = new Grow({
  renderer: new GrowRendererTUI(),
  child: ui
})

console.log(ui.toString())

console.log(grow.render())
