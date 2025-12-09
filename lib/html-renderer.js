function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

class GrowRendererHTML {
  components = {
    Container: function () {
      const width = this.width
      const height = this.height

      // Calculate margins (outside everything)
      const margin = this.margin || { left: 0, top: 0, right: 0, bottom: 0 }
      const marginLeft = margin.left
      const marginTop = margin.top
      const marginRight = margin.right
      const marginBottom = margin.bottom

      // Check if border exists
      const hasBorder = this.decoration && this.decoration.border
      const borderWidth = hasBorder ? 1 : 0

      // Calculate padding (inside decoration/border)
      const padding = this.padding || { left: 0, top: 0, right: 0, bottom: 0 }
      const paddingLeft = padding.left
      const paddingTop = padding.top
      const paddingRight = padding.right
      const paddingBottom = padding.bottom

      // Build styles
      const styles = {
        width: `${width}px`,
        height: `${height}px`,
        margin: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
        padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }

      if (hasBorder) {
        const borderColor = this.decoration.border.color?.toRGBA() || '#000'
        styles.border = `${borderWidth}px solid ${borderColor}`
      }

      if (this.color) {
        styles.backgroundColor = this.color.toRGBA()
      }

      // Render children
      let childrenHTML = ''
      if (this.children && this.children.length > 0) {
        for (const child of this.children) {
          childrenHTML += this.renderer._renderComponent(child)
        }
      }

      const styleStr = Object.entries(styles)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
        .join('; ')

      return `<div style="${styleStr}">${childrenHTML}</div>`
    },

    Center: function () {
      const width = this.width
      const height = this.height

      const styles = {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }

      // Render child if exists
      let childHTML = ''
      if (this.child) {
        childHTML = this.renderer._renderComponent(this.child)
      }

      const styleStr = Object.entries(styles)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
        .join('; ')

      return `<div style="${styleStr}">${childHTML}</div>`
    },

    Text: function () {
      const text = String(this.value)
      const color = this.color
      const colorStr = color
        ? `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha || 1})`
        : 'inherit'

      return `<span style="color: ${colorStr}; textAlign: ${this.textAlign || 'left'}">${escapeHTML(text)}</span>`
    }
  }

  _renderComponent(component) {
    component.renderer = this
    const rendererFn = this.components[component.constructor.name]
    return rendererFn.call(component)
  }

  render(component) {
    const html = this._renderComponent(component)
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: monospace;
      background: #f0f0f0;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`
  }
}

module.exports = { GrowRendererHTML }
