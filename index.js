const { EdgeInsets, Color, Grow, BoxDecoration, Border, Alignment, HotKey } = require('./lib/base')
const { Container, Text, Center, TextAlign, Pressable } = require('./lib/components')
const keys = require('./lib/keys')
// const { GrowRendererHTML } = require('./lib/html-renderer')
const { GrowRendererTUI } = require('./lib/tui-renderer')

const repos = ['my-first-repo', 'grit', 'git-remote-pear-transport']

function List(props = {}) {
  const { children, selected } = props

  return new Container({
    width: '100%',
    height: '60%',
    alignment: Alignment.Center,
    children: [
      new Pressable({
        hotkey: new HotKey({ key: keys.ARROW_DOWN }),
        onPress: function () {
          const newSelected = selected === repos.length - 1 ? 0 : selected + 1

          grow.update(App({ selected: newSelected }))
        }
      }),
      new Pressable({
        hotkey: new HotKey({ key: keys.ARROW_UP }),
        onPress: function () {
          const newSelected = selected === 0 ? repos.length - 1 : selected - 1

          grow.update(App({ selected: newSelected }))
        }
      }),
      ...children.map(
        (child, i) =>
          new Pressable({
            hotkey: i === 0 ? new HotKey({ key: keys.ENTER }) : null,
            onPress: () => {
              // grow.update(App({ openRepo: repos[i] }))
              console.log(repos[selected ?? i])
            },
            child
          })
      )
    ]
  })
}

function App(props = {}) {
  const { selected = -1 } = props

  return new Container({
    width: '100%',
    height: '100%',
    margin: EdgeInsets.all(2),
    alignment: Alignment.Center,
    decoration: new BoxDecoration({
      border: Border.all()
    }),
    children: [
      new Container({
        width: '100%',
        height: 3,
        decoration: new BoxDecoration({
          border: Border.all({
            color: Color.from('#bade5b')
          })
        }),
        children: [
          new Center({
            width: '100%',
            height: 3,
            child: new Text({
              value: 'Pear Git',
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
      List({
        selected,
        children: repos.map(
          (name, i) =>
            new Container({
              width: '50%',
              height: 3,
              decoration: new BoxDecoration({
                border: Border.all({
                  color: selected === i ? Color.from('#fa0') : Color.from('#bade5b')
                })
              }),
              children: [
                new Text({
                  value: name,
                  color: Color.from('#fff')
                })
              ]
            })
        )
      })
    ]
  })
}

const grow = new Grow({
  renderer: new GrowRendererTUI(),
  child: App()
})

grow.render()

// {
//   const grow = new Grow({
//     renderer: new GrowRendererHTML(),
//     child: ui
//   })

//   ui.setAttribute('width', 720)
//   ui.setAttribute('height', 480)

//   console.log(grow.render())
// }
