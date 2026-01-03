const { EdgeInsets, Color, Lyse, BoxDecoration, Border, Alignment, HotKey, keys } = require('.')
const { Container, Text, Center, Pressable, Scrollable, List } = require('lyse/components')
// const { LyseRendererHTML } = require('./lib/html-renderer')
const { LyseRendererTUI } = require('lyse/renderers')
const fs = require('fs')

const repos = [
  'my-first-repo',
  'lyse',
  'git-remote-pear-transport',
  'pear-desktop',
  'pear-runtime',
  'bare-kit',
  'bare-dev',
  'hypercore',
  'hyperswarm',
  'hyperdht',
  'hypercore-crypto',
  'compact-encoding',
  'protomux',
  'b4a',
  'random-access-storage',
  'random-access-file',
  'brittle',
  'quickbit',
  'safety-catch'
]

const fileContent = fs.readFileSync('./example.js', 'utf8')
const lines = fileContent.split('\n')

const Repos = (props) => {
  const { selected, scrollOffset, viewportItemCount } = props

  const list = new List({
    selected,
    scrollOffset,
    viewportItemCount,
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

  list.on('navigate', (data) => {
    lyse.update(App({ ...props, ...data }))
  })

  return [
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
      value: 'Use ↑/↓ to navigate the scrollable list',
      color: Color.from({ red: 200, green: 200, blue: 200 })
    }),
    list,
    new Text({
      value: `${selected + 1}/${repos.length} | scroll: ${scrollOffset}`,
      color: Color.from({ red: 100, green: 100, blue: 100 })
    })
  ]
}

function App(props = {}) {
  const { selected = -1, scrollOffset = 0, viewportItemCount = 0, selectedRepo } = props

  return new Container({
    width: '100%',
    height: '100%',
    margin: EdgeInsets.all(2),
    alignment: Alignment.Center,
    decoration: new BoxDecoration({
      border: Border.all()
    }),
    children: selectedRepo
      ? [
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
                  value: 'Pear Git - ' + repos[selected],
                  color: Color.from('#fff')
                })
              })
            ]
          }),

          new Container({
            width: '100%',
            height: 'calc(100% - 3)',
            decoration: new BoxDecoration({
              border: Border.all({
                color: Color.from('#bade5b')
              })
            }),
            children: [
              new Pressable({
                hotkey: new HotKey({ key: keys.ARROW_UP }),
                onPress: function () {
                  const newScrollOffset = scrollOffset > 0 ? scrollOffset - 1 : scrollOffset
                  lyse.update(App({ scrollOffset: newScrollOffset, selected, selectedRepo }))
                }
              }),

              new Pressable({
                hotkey: new HotKey({ key: keys.ARROW_DOWN }),
                onPress: function () {
                  const newScrollOffset =
                    scrollOffset < lines.length ? scrollOffset + 1 : scrollOffset
                  lyse.update(App({ scrollOffset: newScrollOffset, selected, selectedRepo }))
                }
              }),
              new Scrollable({
                width: '100%',
                height: '100%',
                scrollOffset,
                child: new Container({
                  width: '100%',
                  height: '100%',
                  children: lines.map(
                    (line) =>
                      new Text({
                        value: line,
                        width: '100%'
                      })
                  )
                })
              })
            ]
          })
        ]
      : Repos({ selected, scrollOffset, viewportItemCount })
  })
}

const lyse = new Lyse({
  renderer: new LyseRendererTUI(),
  child: App()
})

lyse.render()

// {
//   const lyse = new Lyse({
//     renderer: new LyseRendererHTML(),
//     child: ui
//   })

//   ui.setAttribute('width', 720)
//   ui.setAttribute('height', 480)

//   console.log(lyse.render())
// }
