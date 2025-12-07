const process = require('process')

class GrowRendererTUI {
  components = {
    Container: function () {
      const width = Math.floor(this.width / 10)
      const height = Math.floor(this.height / 10)

      // Calculate margins (outside everything)
      const margin = this.margin || { left: 0, top: 0, right: 0, bottom: 0 }
      const marginLeft = Math.floor(margin.left / 10)
      const marginTop = Math.floor(margin.top / 10)
      const marginRight = Math.floor(margin.right / 10)
      const marginBottom = Math.floor(margin.bottom / 10)

      // Check if border exists
      const hasBorder = this.decoration && this.decoration.border
      const borderWidth = hasBorder ? 1 : 0

      // Calculate padding (inside decoration/border)
      const padding = this.padding || { left: 0, top: 0, right: 0, bottom: 0 }
      const paddingLeft = Math.floor(padding.left / 10)
      const paddingTop = Math.floor(padding.top / 10)
      const paddingRight = Math.floor(padding.right / 10)
      const paddingBottom = Math.floor(padding.bottom / 10)

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

        for (const child of this.children) {
          const childGrid = this.renderer._renderComponent(child)
          this.renderer._mergeIntoBuffer(grid, childGrid, childBaseX, childCurrentY)

          // Move down by the height of the child
          childCurrentY += childGrid.length
        }
      }

      return grid
    },

    Text: function () {
      const text = String(this.value)
      const grid = [[]]

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

  _renderComponent(component) {
    component.renderer = this
    const rendererFn = this.components[component.constructor.name]
    return rendererFn.call(component)
  }

  render(component) {
    const buffer = this._renderComponent(component)

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
