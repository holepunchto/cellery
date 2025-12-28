const { EdgeInsets, Color, Grow, BoxDecoration, Border, Alignment, HotKey } = require('./lib/base')
const { Container, Text, Center, TextAlign, Pressable, Scrollable } = require('./lib/components')
const keys = require('./lib/keys')
// const { GrowRendererHTML } = require('./lib/html-renderer')
const { GrowRendererTUI } = require('./lib/tui-renderer')

const repos = [
  'my-first-repo',
  'grit',
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
  const { children, selected, scrollOffset = 0 } = props

  const TRIGGER_DISTANCE = 1 // Start scrolling when 1 item from edge

  // Calculate new scroll offset based on viewport info from last render
  let newScrollOffset = scrollOffset

  if (selected >= 0 && scrollableRef?._renderedViewport) {
    const { itemCount: viewportItemCount } = scrollableRef._renderedViewport

    if (viewportItemCount > 0) {
      const positionInViewport = selected - scrollOffset

      // Scroll down if we're too close to bottom
      if (positionInViewport >= viewportItemCount - TRIGGER_DISTANCE) {
        newScrollOffset = Math.min(
          repos.length - viewportItemCount,
          selected - viewportItemCount + TRIGGER_DISTANCE + 1
        )
      }

      // Scroll up if we're too close to top
      if (positionInViewport < TRIGGER_DISTANCE) {
        newScrollOffset = Math.max(0, selected - TRIGGER_DISTANCE)
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
      grow.update(App({ selected: newSelected, scrollOffset: newScrollOffset }))
    }
  })

  const downControl = new Pressable({
    hotkey: new HotKey({ key: keys.ARROW_DOWN }),
    onPress: function () {
      const newSelected = selected === repos.length - 1 ? 0 : selected + 1
      grow.update(App({ selected: newSelected, scrollOffset: newScrollOffset }))
    }
  })

  // Create the scrollable component
  // Use calc: parent height minus 1 row for footer
  const scrollable = new Scrollable({
    width: '100%',
    height: 'calc(100% - 1)', // Reserve 1 row for footer
    scrollOffset: newScrollOffset,
    children: children.map(
      (child, i) =>
        new Pressable({
          hotkey: i === selected ? new HotKey({ key: keys.ENTER }) : null,
          onPress: () => {
            console.log('Selected:', repos[i])
          },
          child
        })
    )
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
    height: '60%',
    alignment: Alignment.Center,
    children: [upControl, downControl, scrollable, footer]
  })
}

function App(props = {}) {
  const { selected = -1, scrollOffset = 0 } = props

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
