const process = require('process')
const { cursorPosition, eraseLine } = require('bare-ansi-escapes')
const { Alignment } = require('./base')
const goodbye = require('graceful-goodbye')

const originalRawMode = process.stdin.isRaw

function start() {
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding('utf8')

  process.stdout.write('\x1b[?1049h')
  process.stdout.write('\x1b[?25l')

  process.stdout.write(cursorPosition(0))
  process.stdout.write(eraseLine)
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
  const width = parseDimension(this.width, this.parent.width)
  const height = parseDimension(this.height, this.parent.height)

  // this.width = width
  // this.height = height
  //
  return {
    width: Math.floor(width),
    height: Math.floor(height)
  }
}

class GrowRendererTUI {
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

      // Create grid
      const grid = []
      for (let y = 0; y < height; y++) {
        const row = []
        for (let x = 0; x < width; x++) {
          let char = ' '
          let color = null

          // Check if we're in the margin area (outside)
          const inMarginX = x < marginLeft || x >= width - marginRight
          const inMarginY = y < marginTop || y >= height - marginBottom

          // Only render border/decoration if not in margin
          if (!inMarginX && !inMarginY && hasBorder) {
            // Adjust coordinates relative to decoration area (after margin)
            const decorationX = x - marginLeft
            const decorationY = y - marginTop
            const decorationWidth = width - marginLeft - marginRight
            const decorationHeight = height - marginTop - marginBottom

            // Check border positions (using -1 for last index)
            if (decorationX === 0 && decorationY === 0) {
              char = '┌'
              color = this.decoration.border.color
            } else if (decorationX === 0 && decorationY === decorationHeight - 1) {
              char = '└'
              color = this.decoration.border.color
            } else if (decorationX === decorationWidth - 1 && decorationY === 0) {
              char = '┐'
              color = this.decoration.border.color
            } else if (
              decorationX === decorationWidth - 1 &&
              decorationY === decorationHeight - 1
            ) {
              char = '┘'
              color = this.decoration.border.color
            } else if (decorationX === 0 || decorationX === decorationWidth - 1) {
              char = '│'
              color = this.decoration.border.color
            } else if (decorationY === 0 || decorationY === decorationHeight - 1) {
              char = '─'
              color = this.decoration.border.color
            }
          }

          row.push({ char, color })
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

        this.width = availableWidth
        this.height = availableHeight

        for (const child of this.children) {
          // Set dimensions for children that don't have them (like Center without explicit size)
          if (!child.width) child.width = availableWidth
          if (!child.height && child.constructor.name === 'Center') {
            // For Center, give it remaining height
            const remainingHeight =
              height - childCurrentY - marginBottom - borderWidth - paddingBottom
            child.height = remainingHeight
          }

          const childGrid = this.renderer._renderComponent(child, {
            parent: this
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
      const { width, height } = getDimensions.call(this)

      // Create empty grid
      const grid = []
      for (let y = 0; y < height; y++) {
        const row = []
        for (let x = 0; x < width; x++) {
          row.push({ char: ' ', color: null })
        }
        grid.push(row)
      }

      this.width = width
      this.height = height

      // Render child if exists
      if (this.child) {
        const childGrid = this.renderer._renderComponent(this.child, {
          parent: this
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

      // TODO: textAlign

      for (let i = 0; i < text.length; i++) {
        grid[0].push({ char: text[i], color: this.color })
      }

      return grid
    }
  }

  _rgbToAnsi(color) {
    if (!color) return ''
    const { red, green, blue } = color
    return `\x1b[38;2;${red};${green};${blue}m`
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

        buffer[targetY][targetX] = componentGrid[dy][dx]
      }
    }
  }

  _renderComponent(component, opts = {}) {
    component.renderer = this
    component.parent = opts.parent
    const rendererFn = this.components[component.constructor.name]
    return rendererFn.call(component)
  }

  render(component) {
    const buffer = this._renderComponent(component, {
      parent: { width: process.stdout.columns, height: process.stdout.rows }
    })

    start()

    if (process.stdin.isTTY) {
      process.stdin.on('data', (data) => {
        const key = data.toString()

        if (key === '\u0003' || key === '\u001b' || key === 'q') {
          // Ctrl+C
          process.exit(0)
        }
      })
    }

    process.on('SIGINT', exit)
    process.on('SIGTERM', exit)
    process.on('exit', exit)

    goodbye(() => {
      exit()
    })

    // Render the final buffer
    for (const row of buffer) {
      for (const pixel of row) {
        if (pixel.color) {
          process.stdout.write(this._rgbToAnsi(pixel.color))
        }
        process.stdout.write(pixel.char)
        if (pixel.color) {
          process.stdout.write(this._resetAnsi())
        }
      }
      process.stdout.write('\n')
    }
  }
}

module.exports = { GrowRendererTUI }
