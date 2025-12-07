const { EdgeInsets, Color, Grow, BoxDecoration, Border } = require('./lib/base')
const { Container, Text } = require('./lib/components')
const { GrowRendererHTML } = require('./lib/html-renderer')
const { GrowRendererTUI } = require('./lib/tui-renderer')

const ui = new Container({
  width: 1000,
  height: 100,
  margin: EdgeInsets.all(10),
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
    }),
    new Container({
      width: 500,
      height: 30,
      decoration: new BoxDecoration({
        border: Border.all({ color: Color.from({ red: 255 }) })
      }),
      children: [
        new Text({
          value: 'Inner',
          color: Color.from({ green: 255 })
        })
      ]
    })
  ]
})

// ui.setAttribute('width', 250)
// console.log(ui.toString())

{
  const grow = new Grow({
    renderer: new GrowRendererTUI(),
    child: ui
  })

  grow.render()
}

{
  const grow = new Grow({
    renderer: new GrowRendererHTML(),
    child: ui
  })

  console.log(grow.render())
}
