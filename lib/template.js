const cells = require('./cells')
const compat = require('./compat')

const SENTINEL = '\x00'

const registry = {
  ...compat,
  ...cells
}

function register(cells) {
  Object.assign(registry, cells)
}

function cellery(strings, ...values) {
  let raw = ''
  const slots = []
  for (let i = 0; i < strings.length; i++) {
    raw += strings[i]
    if (i < values.length) {
      const id = slots.length
      slots.push(values[i])
      raw += SENTINEL + id + SENTINEL
    }
  }

  const ast = parse(raw, slots)
  if (!ast) throw new Error('Empty template')
  return build(ast, slots)
}

// ---- parser ----

function parse(input, slots) {
  let pos = 0

  function peek() {
    return input[pos]
  }
  function advance() {
    return input[pos++]
  }
  function eof() {
    return pos >= input.length
  }

  function skip() {
    while (!eof() && /\s/.test(peek())) advance()
  }

  const SLOT_RE = new RegExp(SENTINEL + '(\\d+)' + SENTINEL, 'g')
  const SLOT_PURE = new RegExp('^' + SENTINEL + '(\\d+)' + SENTINEL + '$')

  function resolveValue(str) {
    str = str.trim()
    // Pure placeholder — preserve type
    const m = str.match(SLOT_PURE)
    if (m) return slots[parseInt(m[1])]
    // Mixed content — inline replace as strings
    if (str.includes(SENTINEL)) {
      return str.replace(SLOT_RE, (_, id) => String(slots[parseInt(id)]))
    }
    if (str === 'true') return true
    if (str === 'false') return false
    if (str !== '' && !isNaN(str)) return Number(str)
    if (
      (str[0] === '"' && str[str.length - 1] === '"') ||
      (str[0] === "'" && str[str.length - 1] === "'")
    ) {
      return str.slice(1, -1)
    }
    return str
  }

  function parseNode() {
    skip()
    if (eof()) return null
    if (peek() === '<') {
      if (input[pos + 1] === '/') return null
      return parseElement()
    }
    return parseText()
  }

  function parseText() {
    let buf = ''
    while (!eof() && peek() !== '<') buf += advance()
    buf = buf.trim()
    if (!buf) return null
    return { type: 'text', value: resolveValue(buf) }
  }

  function parseElement() {
    advance() // <

    let name = ''
    while (!eof() && /[a-zA-Z0-9_.]/.test(peek())) name += advance()

    const attrs = parseAttrs()

    let selfClose = false
    if (peek() === '/') {
      selfClose = true
      advance()
    }
    advance() // >

    if (selfClose) return { type: 'element', tag: name, attrs, children: [] }

    const children = []
    while (!eof()) {
      skip()
      if (eof()) break
      if (peek() === '<' && input[pos + 1] === '/') break
      const child = parseNode()
      if (child) children.push(child)
      else break
    }

    if (!eof() && peek() === '<' && input[pos + 1] === '/') {
      advance()
      advance()
      while (!eof() && peek() !== '>') advance()
      if (!eof()) advance()
    }

    return { type: 'element', tag: name, attrs, children }
  }

  function parseAttrs() {
    const attrs = {}

    while (!eof()) {
      skip()
      if (peek() === '>' || peek() === '/') break

      let name = ''
      while (!eof() && /[a-zA-Z0-9_\-]/.test(peek())) name += advance()
      if (!name) break

      if (peek() === '=') {
        advance()
        let val = ''

        if (peek() === '"' || peek() === "'") {
          const q = advance()
          while (!eof() && peek() !== q) val += advance()
          if (!eof()) advance()
        } else {
          while (!eof() && !/[\s>\/]/.test(peek())) val += advance()
        }

        attrs[name] = name === 'events' ? resolveValue(val).split(',') : resolveValue(val)
      } else {
        attrs[name] = true
      }
    }

    return attrs
  }

  return parseNode()
}

// ---- builder ----

function isPromise(val) {
  return val != null && typeof val.then === 'function'
}

function isStream(val) {
  return val != null && typeof val.on === 'function' && !(val instanceof cells.Cell)
}

function build(node, slots) {
  if (node.type === 'text') return node.value

  const Ctor = registry[node.tag]
  if (!Ctor) throw new Error('Unknown cell: ' + node.tag)

  let style = null
  const children = node.children
    .flatMap((c) => {
      const built = build(c, slots)
      return Array.isArray(built) ? built : [built]
    })
    .filter((c) => {
      if (c instanceof cells.Style) {
        style = c
        return false
      }
      return c !== null
    })

  const cell = new Ctor({
    ...node.attrs,
    children,
    style,
    cells: node.tag.toLowerCase() === 'style' ? registry : undefined
  })

  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    if (isPromise(child)) {
      child.then((val) => {
        children[i] = val
        cell.render()
      })
    } else if (isStream(child)) {
      child.on('data', (val) => {
        children[i] = val
        cell.render()
      })
    }
  }

  return cell
}

module.exports = { cellery, register }
