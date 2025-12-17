const process = require('process')
const { cursorPosition, eraseLine, eraseDisplay } = require('bare-ansi-escapes')
const { Alignment, BoxDecoration, Border, Color } = require('./base')
const goodbye = require('graceful-goodbye')

const originalRawMode = process.stdin.isRaw

function start() {
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding('utf8')

  process.stdout.write('\x1b[?1049h')
  process.stdout.write('\x1b[?25l')
}

function exit() {
  process.stdout.write(cursorPosition(0))
  process.stdout.write(eraseLine)
  process.stdin.setRawMode(originalRawMode)
  process.stdout.write('\x1b[?25h')
  process.stdout.write('\x1b[?1049l')
}

function parseDimension(value, parentValue) {
  if (typeof value === 'number') {
    return value
  } else if (typeof value === 'string' && value.endsWith('%')) {
    const percent = Number(value.replace('%', '')) / 100
    return parentValue * percent
  }

  return 0
}

function getDimensions() {
  const width = parseDimension(this.width, this.parent?.width)
  const height = parseDimension(this.height, this.parent?.height)

  return {
    width: Math.floor(width),
    height: Math.floor(height)
  }
}

class GrowRendererTUI {
  hotkeys = new Map()

  components = {
    Container: function () {
      const { width, height } = getDimensions.call(this)

      // Calculate margins (outside everything)
      const margin = this.margin || { left: 0, top: 0, right: 0, bottom: 0 }
      const marginLeft = Math.floor(margin.left)
      const marginTop = Math.floor(margin.top)
      const marginRight = Math.floor(margin.right)
      const marginBottom = Math.floor(margin.bottom)

      // Check if border exists
      const hasBorder = this.decoration && this.decoration.border
      const borderWidth = hasBorder ? 1 : 0

      // Calculate padding (inside decoration/border)
      const padding = this.padding || { left: 0, top: 0, right: 0, bottom: 0 }
      const paddingLeft = Math.floor(padding.left)
      const paddingTop = Math.floor(padding.top)
      const paddingRight = Math.floor(padding.right)
      const paddingBottom = Math.floor(padding.bottom)

      // Get background color
      const backgroundColor = this.decoration?.color || this.color || null

      // Create grid
      const grid = []
      for (let y = 0; y < height; y++) {
        const row = []
        for (let x = 0; x < width; x++) {
          let char = ' '
          let fgColor = null
          let bgColor = null

          // Check if we're in the margin area (outside)
          const inMarginX = x < marginLeft || x >= width - marginRight
          const inMarginY = y < marginTop || y >= height - marginBottom

          // Adjust coordinates relative to decoration area (after margin)
          const decorationX = x - marginLeft
          const decorationY = y - marginTop
          const decorationWidth = width - marginLeft - marginRight
          const decorationHeight = height - marginTop - marginBottom

          // Check if we're on the border
          const onBorder =
            !inMarginX &&
            !inMarginY &&
            hasBorder &&
            (decorationX === 0 ||
              decorationX === decorationWidth - 1 ||
              decorationY === 0 ||
              decorationY === decorationHeight - 1)

          // Apply background color if not in margin and not on border
          if (!inMarginX && !inMarginY && !onBorder && backgroundColor) {
            bgColor = backgroundColor
          }

          // Only render border/decoration if not in margin
          if (!inMarginX && !inMarginY && hasBorder) {
            // Check border positions (using -1 for last index)
            if (decorationX === 0 && decorationY === 0) {
              char = '┌'
              fgColor = this.decoration.border.color
            } else if (decorationX === 0 && decorationY === decorationHeight - 1) {
              char = '└'
              fgColor = this.decoration.border.color
            } else if (decorationX === decorationWidth - 1 && decorationY === 0) {
              char = '┐'
              fgColor = this.decoration.border.color
            } else if (
              decorationX === decorationWidth - 1 &&
              decorationY === decorationHeight - 1
            ) {
              char = '┘'
              fgColor = this.decoration.border.color
            } else if (decorationX === 0 || decorationX === decorationWidth - 1) {
              char = '│'
              fgColor = this.decoration.border.color
            } else if (decorationY === 0 || decorationY === decorationHeight - 1) {
              char = '─'
              fgColor = this.decoration.border.color
            }
          }

          row.push({ char, fgColor, bgColor })
        }
        grid.push(row)
      }

      // Render children vertically stacked
      // Children go inside: margin → border → padding
      if (this.children && this.children.length > 0) {
        const childBaseX = marginLeft + borderWidth + paddingLeft
        let childCurrentY = marginTop + borderWidth + paddingTop

        // Calculate available width and height for children
        const availableWidth =
          width - marginLeft - marginRight - borderWidth * 2 - paddingLeft - paddingRight

        const availableHeight =
          height - marginTop - marginBottom - borderWidth * 2 - paddingTop - paddingBottom

        const childParent = {
          width: availableWidth,
          height: availableHeight
        }

        for (const child of this.children) {
          const childGrid = this.renderer._renderComponent(child, {
            parent: childParent
          })

          // Calculate horizontal position based on alignment
          let childX = childBaseX
          const childWidth = childGrid[0]?.length || 0

          if (this.alignment === Alignment.Center) {
            childX = childBaseX + Math.floor((availableWidth - childWidth) / 2)
          } else if (this.alignment === Alignment.Right) {
            childX = childBaseX + (availableWidth - childWidth)
          }

          this.renderer._mergeIntoBuffer(grid, childGrid, childX, childCurrentY)

          // Move down by the height of the child
          childCurrentY += childGrid.length
        }
      }

      return grid
    },

    Center: function () {
      const { width, height } = getDimensions.call(this.parent)

      // Create empty grid
      const grid = []
      for (let y = 0; y < height; y++) {
        const row = []
        for (let x = 0; x < width; x++) {
          row.push({ char: ' ', fgColor: null, bgColor: null })
        }
        grid.push(row)
      }

      // Render child if exists
      if (this.child) {
        const childParent = {
          width: width,
          height: height
        }

        const childGrid = this.renderer._renderComponent(this.child, {
          parent: childParent
        })

        // Calculate center position
        const childWidth = childGrid[0]?.length || 0
        const childHeight = childGrid.length

        const centerX = Math.floor((width - childWidth) / 2)
        const centerY = Math.floor((height - childHeight) / 2)

        this.renderer._mergeIntoBuffer(grid, childGrid, centerX, centerY)
      }

      return grid
    },

    Text: function () {
      const text = String(this.value)
      const grid = [[]]

      for (let i = 0; i < text.length; i++) {
        grid[0].push({ char: text[i], fgColor: this.color, bgColor: null })
      }

      return grid
    },

    Pressable: function () {
      // TODO: handle press animations

      // Render child if exists
      if (!this.child) return

      if (this.hotkey) {
        this.renderer.registerHotkey(this.hotkey, () => {
          this.onPress()
        })
      }

      return this.renderer._renderComponent(this.child, {
        parent: this.parent
      })
    }
  }

  _fgColorToAnsi(color) {
    if (!color) return ''
    const { red, green, blue } = color
    return `\x1b[38;2;${red};${green};${blue}m`
  }

  _bgColorToAnsi(color) {
    if (!color) return ''
    const { red, green, blue } = color
    return `\x1b[48;2;${red};${green};${blue}m`
  }

  _resetAnsi() {
    return '\x1b[0m'
  }

  _mergeIntoBuffer(buffer, componentGrid, offsetX = 0, offsetY = 0) {
    for (let dy = 0; dy < componentGrid.length; dy++) {
      const targetY = offsetY + dy
      if (targetY < 0 || targetY >= buffer.length) continue

      for (let dx = 0; dx < componentGrid[dy].length; dx++) {
        const targetX = offsetX + dx
        if (targetX < 0 || targetX >= buffer[targetY].length) continue

        const sourcePixel = componentGrid[dy][dx]
        const targetPixel = buffer[targetY][targetX]

        // Merge the pixels - preserve background if source doesn't have one
        buffer[targetY][targetX] = {
          char: sourcePixel.char,
          fgColor: sourcePixel.fgColor,
          bgColor: sourcePixel.bgColor !== null ? sourcePixel.bgColor : targetPixel.bgColor
        }
      }
    }
  }

  _renderComponent(component, opts = {}) {
    component.renderer = this
    component.parent = opts.parent
    const rendererFn = this.components[component.constructor.name]
    return rendererFn.call(component)
  }

  registerHotkey(hotkey, fn) {
    const key = hotkey.key
    this.hotkeys.set(key, fn)
  }

  clearHotkeys() {
    this.hotkeys.clear()
  }

  setup() {
    if (this.isSetup) return
    this.isSetup = true

    start()

    if (process.stdin.isTTY) {
      process.stdin.on('data', (data) => {
        const key = data.toString()

        if (key === '\u0003' || key === '\u001b' || key === 'q') {
          // Ctrl+C
          process.exit(0)
        }

        // Compare against the key string directly (not hotkey object)
        for (const [hotkeyString, fn] of this.hotkeys.entries()) {
          if (key === hotkeyString) {
            fn()
            this.hotkeys.delete(hotkeyString)
          }
        }
      })
    }

    process.on('SIGINT', exit)
    process.on('SIGTERM', exit)
    process.on('exit', exit)

    goodbye(() => {
      exit()
    })
  }

  draw() {
    this.clearHotkeys()

    const buffer = this._renderComponent(this.root, {
      parent: this.size
    })

    process.stdout.write(eraseDisplay)
    process.stdout.write(cursorPosition(0, 0))

    for (const row of buffer) {
      for (const pixel of row) {
        if (pixel.bgColor) {
          process.stdout.write(this._bgColorToAnsi(pixel.bgColor))
        }
        if (pixel.fgColor) {
          process.stdout.write(this._fgColorToAnsi(pixel.fgColor))
        }
        process.stdout.write(pixel.char)
        if (pixel.fgColor || pixel.bgColor) {
          process.stdout.write(this._resetAnsi())
        }
      }
      process.stdout.write('\n')
    }
  }

  render(component) {
    if (component) {
      this.root = component
      this.size = { width: process.stdout.columns, height: process.stdout.rows }
    }

    this.setup()

    this.draw()
  }
}

module.exports = { GrowRendererTUI }
