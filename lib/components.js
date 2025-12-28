const { GrowComponent } = require('./base')

class Center extends GrowComponent {
  constructor(opts = {}) {
    super(opts)

    this.child = opts.child
  }
}

class Container extends GrowComponent {
  static observedAttributes = ['width', 'height']

  constructor(opts = {}) {
    super(opts)
    this.width = opts.width
    this.height = opts.height
    this.alignment = opts.alignment
    this.margin = opts.margin
    this.padding = opts.padding
    this.decoration = opts.decoration
    this.color = opts.color
    this.children = opts.children || []
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log('attributeChangedCallback', name, oldValue, newValue)
  }
}

const TextAlign = {
  Left: 'left',
  Right: 'right',
  Center: 'center'
}

class Text extends GrowComponent {
  constructor(opts = {}) {
    super(opts)

    this.value = opts.value || ''
    this.color = opts.color
    this.textAlign = opts.textAlign
  }
}

class Pressable extends GrowComponent {
  hotkey = null
  #onPress = null

  constructor(opts = {}) {
    super(opts)

    this.child = opts.child
    this.#onPress = opts.onPress
    this.hotkey = opts.hotkey
  }

  async onPress() {
    if (!this.#onPress) return

    await this.#onPress()
  }
}

/**
 * Scrollable component - manages viewport and scroll offset
 *
 * The framework keeps it simple: this component just tracks scroll state.
 * Renderers implement their own scroll triggering logic while maintaining
 * consistent UX.
 *
 * Takes a single child (typically a Container with children array)
 */
class Scrollable extends GrowComponent {
  constructor(opts = {}) {
    super(opts)

    this.width = opts.width
    this.height = opts.height
    this.child = opts.child // Single child, not children array

    // Scroll state - managed by the component consumer (e.g., your app logic)
    this.scrollOffset = opts.scrollOffset || 0

    // Optional: callback when scroll would be useful (renderer can trigger this)
    this.onScrollRequest = opts.onScrollRequest || null

    // Renderer will populate this after rendering
    this._renderedViewport = null
  }

  /**
   * Get viewport info from last render
   * Renderer populates this during render
   */
  getViewportInfo() {
    return this._renderedViewport || { itemCount: 0, height: 0 }
  }

  /**
   * Request scroll by delta
   * This is called by renderers or application logic to update scroll position
   */
  requestScroll(delta) {
    const newOffset = this.scrollOffset + delta

    if (this.onScrollRequest) {
      this.onScrollRequest(newOffset, delta)
    }

    return newOffset
  }

  /**
   * Scroll to make a specific child index visible
   * Returns the new scroll offset
   */
  scrollToIndex(index, viewportHeight) {
    if (index < this.scrollOffset) {
      // Scroll up to show this item
      return index
    } else if (index >= this.scrollOffset + viewportHeight) {
      // Scroll down to show this item
      return index - viewportHeight + 1
    }

    return this.scrollOffset
  }

  /**
   * Check if we can scroll in a direction
   * childCount is the number of items in the scrollable content
   */
  canScroll(direction, viewportHeight, childCount) {
    if (direction < 0) {
      return this.scrollOffset > 0
    } else {
      return this.scrollOffset + viewportHeight < childCount
    }
  }

  /**
   * Get the visible range of children for current scroll position
   * childCount is the total number of items
   */
  getVisibleRange(viewportHeight, childCount) {
    const start = Math.max(0, this.scrollOffset)
    const end = Math.min(childCount, start + viewportHeight)

    return { start, end }
  }
}

module.exports = {
  Center,
  Container,
  Pressable,
  Scrollable,
  Text,
  TextAlign
}
