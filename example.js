const { EdgeInsets, Color, Lyse, BoxDecoration, Border, Alignment, HotKey, keys } = require('.')
const { Container, Text, Center, Pressable, Scrollable } = require('lyse/components')
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
// Load file content once
const fileContent = fs.readFileSync('./example.js', 'utf8')
const lines = fileContent.split('\n')

// Create persistent stateful components outside render function
let selected = 0
let currentView = 'list' // 'list' or 'file'

// Scrollable for the repo list - maintains its own scroll state
const listScrollable = new Scrollable({
  width: '100%',
  height: 'calc(100% - 1)',
  scrollOffset: 0,
  child: new Container({
    width: '100%',
    height: '100%',
    alignment: Alignment.Center,
    children: [] // Will be populated in render
  })
})

// Scrollable for file viewer - maintains its own scroll state
const fileScrollable = new Scrollable({
  width: '100%',
  height: '100%',
  scrollOffset: 0,
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

// Navigation controls for list view
const listUpControl = new Pressable({
  hotkey: new HotKey({ key: keys.ARROW_UP }),
  onPress: function () {
    selected = selected === 0 ? repos.length - 1 : selected - 1
    updateListView()
    lyse.render()
  }
})

const listDownControl = new Pressable({
  hotkey: new HotKey({ key: keys.ARROW_DOWN }),
  onPress: function () {
    selected = selected === repos.length - 1 ? 0 : selected + 1
    updateListView()
    lyse.render()
  }
})

const listEnterControl = new Pressable({
  hotkey: new HotKey({ key: keys.ENTER }),
  onPress: function () {
    currentView = 'file'
    fileScrollable.scrollOffset = 0
    lyse.update(App())
  }
})

// Navigation controls for file view
const fileUpControl = new Pressable({
  hotkey: new HotKey({ key: keys.ARROW_UP }),
  onPress: function () {
    if (fileScrollable.scrollOffset > 0) {
      fileScrollable.scrollOffset--
      lyse.render()
    }
  }
})

const fileDownControl = new Pressable({
  hotkey: new HotKey({ key: keys.ARROW_DOWN }),
  onPress: function () {
    const viewport = fileScrollable._renderedViewport
    if (viewport && fileScrollable.scrollOffset + viewport.itemCount < lines.length) {
      fileScrollable.scrollOffset++
      lyse.render()
    }
  }
})

const fileBackControl = new Pressable({
  hotkey: new HotKey({ key: keys.ESC }),
  onPress: function () {
    currentView = 'list'
    lyse.update(App())
  }
})

// Update list view children based on current selection
function updateListView() {
  // Auto-scroll to keep selection visible
  const viewport = listScrollable._renderedViewport
  if (viewport && viewport.itemCount > 0) {
    const positionInViewport = selected - listScrollable.scrollOffset
    const triggerDistance = 1
    // Scroll down if selection is too close to bottom
    if (positionInViewport >= viewport.itemCount - triggerDistance) {
      listScrollable.scrollOffset = Math.min(
        repos.length - viewport.itemCount,
        selected - viewport.itemCount + triggerDistance + 1
      )
    }
    // Scroll up if selection is too close to top
    if (positionInViewport < triggerDistance) {
      listScrollable.scrollOffset = Math.max(0, selected - triggerDistance)
    }
  }
  // Update list children with current selection highlighting
  listScrollable.child.children = repos.map(
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
}

function App() {
  // Initialize list on first render
  if (listScrollable.child.children.length === 0) {
    updateListView()
  }

  const header = new Container({
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
          value: currentView === 'list' ? 'Pear Git' : `Pear Git - ${repos[selected]}`,
          color: Color.from('#fff')
        })
      })
    ]
  })

  if (currentView === 'file') {
    return new Container({
      width: '100%',
      height: '100%',
      margin: EdgeInsets.all(2),
      alignment: Alignment.Center,
      decoration: new BoxDecoration({
        border: Border.all()
      }),
      children: [
        fileUpControl,
        fileDownControl,
        fileBackControl,
        header,
        new Text({
          value: 'Use ↑/↓ to scroll, ESC to go back',
          color: Color.from({ red: 200, green: 200, blue: 200 })
        }),
        new Container({
          width: '100%',
          height: 'calc(100% - 5)',
          decoration: new BoxDecoration({
            border: Border.all({
              color: Color.from('#bade5b')
            })
          }),
          children: [fileScrollable]
        })
      ]
    })
  }

  // List view
  const footer = new Text({
    value: `${selected + 1}/${repos.length} | scroll: ${listScrollable.scrollOffset}`,
    color: Color.from({ red: 100, green: 100, blue: 100 })
  })

  return new Container({
    width: '100%',
    height: '100%',
    margin: EdgeInsets.all(2),
    alignment: Alignment.Center,
    decoration: new BoxDecoration({
      border: Border.all()
    }),
    children: [
      listUpControl,
      listDownControl,
      listEnterControl,
      header,
      new Text({
        value: 'Use ↑/↓ to navigate, ENTER to view file',
        color: Color.from({ red: 200, green: 200, blue: 200 })
      }),
      new Container({
        width: '100%',
        height: '70%',
        alignment: Alignment.Center,
        children: [listScrollable, footer]
      })
    ]
  })
}
const lyse = new Lyse({
  renderer: new LyseRendererTUI(),
  child: App()
})

lyse.render()
