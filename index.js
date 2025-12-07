const process = require('process')

const { EdgeInsets, Color, Grow, BoxDecoration, Border } = require('./lib/base')
const { Container, Text, Center } = require('./lib/components')
const { GrowRendererHTML } = require('./lib/html-renderer')
const { GrowRendererTUI } = require('./lib/tui-renderer')

const ui = new Container({
  width: 1000,
  height: 100,
  margin: EdgeInsets.all(2),
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
    new Center({
      child: new Container({
        width: process.stdout.columns / 2,
        height: 3,
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
    })
  ]
})

{
  const grow = new Grow({
    renderer: new GrowRendererTUI(),
    child: ui
  })

  ui.setAttribute('width', process.stdout.columns)
  ui.setAttribute('height', process.stdout.rows)

  // TODO: raw mode?
  // process.stdout.on('resize', () => {
  //   ui.setAttribute('width', process.stdout.columns)
  //   ui.setAttribute('height', process.stdout.rows)
  //   grow.render()
  // })

  grow.render()
}

{
  const grow = new Grow({
    renderer: new GrowRendererHTML(),
    child: ui
  })

  ui.setAttribute('width', 720)
  ui.setAttribute('height', 480)

  console.log(grow.render())
}
