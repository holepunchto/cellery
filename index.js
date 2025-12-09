const { EdgeInsets, Color, Grow, BoxDecoration, Border, Alignment } = require('./lib/base')
const { Container, Text, Center, TextAlign } = require('./lib/components')
const { GrowRendererHTML } = require('./lib/html-renderer')
const { GrowRendererTUI } = require('./lib/tui-renderer')

const ui = new Container({
  width: '100%',
  height: '100%',
  margin: EdgeInsets.all(2),
  color: Color.from('#000'),
  alignment: Alignment.Center,
  decoration: new BoxDecoration({
    border: Border.all()
  }),
  children: [
    new Container({
      width: '100%',
      height: 3,
      decoration: new BoxDecoration({
        border: Border.all({ color: Color.from('#bade5b') })
      }),
      children: [
        new Center({
          width: '100%',
          height: 3,
          child: new Text({
            value: 'My First Repo',
            color: Color.from('#fff')
          })
        })
      ]
    }),
    new Text({
      value: 'Hello world!',
      color: Color.from({ red: 255 })
    }),
    new Text({
      value: 'Hello again!',
      textAlign: TextAlign.Right,
      color: Color.from({ blue: 255 })
    }),
    new Container({
      width: '50%',
      height: 3,
      decoration: new BoxDecoration({
        border: Border.all({ color: Color.from('#bade5b') })
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

{
  const grow = new Grow({
    renderer: new GrowRendererTUI(),
    child: ui
  })

  // TODO: raw mode?
  // process.stdout.on('resize', () => {
  //   ui.setAttribute('width', process.stdout.columns)
  //   ui.setAttribute('height', process.stdout.rows)
  //   grow.render()
  // })

  grow.render()
}

// {
//   const grow = new Grow({
//     renderer: new GrowRendererHTML(),
//     child: ui
//   })

//   ui.setAttribute('width', 720)
//   ui.setAttribute('height', 480)

//   console.log(grow.render())
// }
