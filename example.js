const { EdgeInsets, Color, Lyse, BoxDecoration, Border, Alignment, HotKey, keys } = require('.')
const { Container, Text, Center, Pressable, Scrollable } = require('lyse/components')
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

// Track the scrollable component ref so we can get viewport info
let scrollableRef = null

function List(props = {}) {
  const { children, selected, scrollOffset = 0, triggerDistance = 0 } = props

  // Calculate new scroll offset based on viewport info from last render
  let newScrollOffset = scrollOffset

  if (selected >= 0 && scrollableRef?._renderedViewport) {
    const { itemCount: viewportItemCount } = scrollableRef._renderedViewport

    if (viewportItemCount > 0) {
      const positionInViewport = selected - scrollOffset

      // Scroll down if we're too close to bottom
      if (positionInViewport >= viewportItemCount - triggerDistance) {
        newScrollOffset = Math.min(
          repos.length - viewportItemCount,
          selected - viewportItemCount + triggerDistance + 1
        )
      }

      // Scroll up if we're too close to top
      if (positionInViewport < triggerDistance) {
        newScrollOffset = Math.max(0, selected - triggerDistance)
      }

      // Clamp to valid range
      newScrollOffset = Math.max(
        0,
        Math.min(Math.max(0, repos.length - viewportItemCount), newScrollOffset)
      )
    }
  }

  // Navigation controls (invisible, just for hotkeys)
  const upControl = new Pressable({
    hotkey: new HotKey({ key: keys.ARROW_UP }),
    onPress: function () {
      const newSelected = selected === 0 ? repos.length - 1 : selected - 1
      lyse.update(App({ selected: newSelected, scrollOffset: newScrollOffset }))
    }
  })

  const downControl = new Pressable({
    hotkey: new HotKey({ key: keys.ARROW_DOWN }),
    onPress: function () {
      const newSelected = selected === repos.length - 1 ? 0 : selected + 1
      lyse.update(App({ selected: newSelected, scrollOffset: newScrollOffset }))
    }
  })

  // Create container with all children and their pressables
  const listContainer = new Container({
    width: '100%',
    height: '100%', // Use full height available from Scrollable
    alignment: Alignment.Center,
    children: children.map(
      (child, i) =>
        new Pressable({
          hotkey: i === selected ? new HotKey({ key: keys.ENTER }) : null,
          onPress: () => {
            lyse.update(App({ selected, scrollOffset: 0, selectedRepo: repos[selected] }))
          },
          child
        })
    )
  })

  // Wrap container in scrollable
  const scrollable = new Scrollable({
    width: '100%',
    height: 'calc(100% - 1)', // Reserve 1 row for footer
    scrollOffset: newScrollOffset,
    child: listContainer
  })

  // Store ref for next render
  scrollableRef = scrollable

  // Footer
  const footer = new Text({
    value: `${selected + 1}/${repos.length} | scroll: ${newScrollOffset}`,
    color: Color.from({ red: 100, green: 100, blue: 100 })
  })

  return new Container({
    width: '100%',
    height: '70%',
    alignment: Alignment.Center,
    children: [upControl, downControl, scrollable, footer]
  })
}

const fileContent = fs.readFileSync('./example.js', 'utf8')
const lines = fileContent.split('\n')

function App(props = {}) {
  const { selected = -1, scrollOffset = 0, selectedRepo } = props

  const Repos = () => [
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
    List({
      selected,
      scrollOffset,
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
      : Repos()
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
