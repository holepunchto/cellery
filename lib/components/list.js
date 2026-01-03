const { Cell, HotKey, Alignment } = require('../base')
const keys = require('../keys')
const { Scrollable, Pressable, Container } = require('./base')

class List extends Cell {
  constructor(opts = {}) {
    super(opts)

    this.children = opts.children || []
    this.selected = opts.selected
    this.scrollOffset = opts.scrollOffset || 0
    this.triggerDistance = opts.triggerDistance || 0
    this.viewportItemCount = opts.viewportItemCount || 0
  }

  render() {
    // Calculate new scroll offset based on viewport info from last render
    let newScrollOffset = this.scrollOffset

    if (this.selected >= 0 && this.viewportItemCount) {
      if (this.viewportItemCount > 0) {
        const positionInViewport = this.selected - this.scrollOffset

        // Scroll down if we're too close to bottom
        if (positionInViewport >= this.viewportItemCount - this.triggerDistance) {
          newScrollOffset = Math.min(
            this.children.length - this.viewportItemCount,
            this.selected - this.viewportItemCount + this.triggerDistance + 1
          )
        }

        // Scroll up if we're too close to top
        if (positionInViewport < this.triggerDistance) {
          newScrollOffset = Math.max(0, this.selected - this.triggerDistance)
        }

        // Clamp to valid range
        newScrollOffset = Math.max(
          0,
          Math.min(Math.max(0, this.children.length - this.viewportItemCount), newScrollOffset)
        )
      }
    }

    // Navigation controls (invisible, just for hotkeys)
    const upControl = new Pressable({
      hotkey: new HotKey({ key: keys.ARROW_UP }),
      onPress: () => {
        const newSelected = this.selected === 0 ? this.children.length - 1 : this.selected - 1
        this.emit('navigate', {
          selected: newSelected,
          scrollOffset: newScrollOffset,
          viewportItemCount: this._scrollableRef._renderedViewport.itemCount
        })
      }
    })

    const downControl = new Pressable({
      hotkey: new HotKey({ key: keys.ARROW_DOWN }),
      onPress: () => {
        const newSelected = this.selected === this.children.length - 1 ? 0 : this.selected + 1
        this.emit('navigate', {
          selected: newSelected,
          scrollOffset: newScrollOffset,
          viewportItemCount: this._scrollableRef._renderedViewport.itemCount
        })
      }
    })

    // Create container with all children and their pressables
    const listContainer = new Container({
      width: '100%',
      height: '100%', // Use full height available from Scrollable
      alignment: Alignment.Center,
      children: this.children.map(
        (child, i) =>
          new Pressable({
            hotkey: i === this.selected ? new HotKey({ key: keys.ENTER }) : null,
            onPress: () => {
              this.emit('select', { selected: this.selected })
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
    this._scrollableRef = scrollable

    return new Container({
      width: '100%',
      height: '70%',
      alignment: Alignment.Center,
      children: [upControl, downControl, scrollable]
    })
  }
}

module.exports = List
