const { EdgeInsets, Color, Grow, BoxDecoration, Border, Alignment, HotKey } = require('./lib/base')
const { Container, Text, Center, TextAlign, Pressable } = require('./lib/components')
// const { GrowRendererHTML } = require('./lib/html-renderer')
const { GrowRendererTUI } = require('./lib/tui-renderer')

function App(props = {}) {
  let selected = props.selected || null

  return new Container({
    width: '100%',
    height: '100%',
    margin: EdgeInsets.all(2),
    alignment: Alignment.Center,
    decoration: new BoxDecoration({
      border: Border.all()
    }),
    children: [
      new Pressable({
        onPress: function () {
          this.renderer.render(App({ selected: '1' }))
        },
        hotkey: new HotKey({ key: '1' }),
        child: new Container({
          width: '100%',
          height: 3,
          decoration: new BoxDecoration({
            border: Border.all({
              color: selected === '1' ? Color.from('#f00') : Color.from('#bade5b')
            })
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
        })
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
            color: Color.from('#fff')
          })
        ]
      })
    ]
  })
}

{
  const grow = new Grow({
    renderer: new GrowRendererTUI(),
    child: App()
  })

  // TODO: auto resize?
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
