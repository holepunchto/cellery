# Cellery

> **WIP** - A stream-driven cross-platform UI framework

Cellery is a minimal UI framework built around streams. Components called **Cells** subscribe to events and emit render instructions — no virtual DOM, no framework lock-in. Any Adapter can consume the output: HTML, TUI, native, mobile, whatever fits your use case.

## How it works

Cellery sits at the end of a pipeline. Writers (state machines, database change feeds, RPC streams) push events in, and Cells react by emitting render instructions out.

This publishes events to `Cellery` which you can subscribe to.

```js
const { Cellery } = require('cellery')

pipeline(
  myWriter,
  new Transform({
    transform(status, cb) {
      this.push({ event: 'something-happened', status })
      cb()
    }
  }),
  cellery
)
```

Cells subscribe to events and re-render reactively:

```js
const welcome = new Message({ id: 'welcome', value: 'Welcome', cellery })

welcome.sub({ event: 'login' }, (cell, { user }) => {
  cell.value = `Welcome back ${user.displayName}`
  cell.render({ id: 'messages', insert: 'beforeend' })
})
```

Or you render Cells at will, passing details how they should render:

```js
const msg = new Message({ value: 'Use /join <invite> to join a room', cellery })
msg.render({ id: 'messages', insert: 'beforeend' })
```

Rendering is handled by `Adapters`. Currently these are simply called by `Cellery` to render components when components manually choose to be re-rendered. By default they pass along meta so your `adapter` can figure out what to do with them. But there's no rules, no lifecycles. Just streams of content and events for your to react to as you need.

## Cells

We're trying to keep Cells simple. A super basic set of low level components to see how much can be achieved with little.

| Cell        | Description                              |
|-------------|------------------------------------------|
| `Cell`      | Base class for all components            |
| `MultiCell` | Composes multiple cells into one render  |
| `Container` | Layout wrapper with scroll and flex opts |
| `App`       | Root cell, id is always `'app'`          |
| `Text`      | Inline text content                      |
| `Paragraph` | Block text content                       |
| `Input`     | Text input, single or multiline          |

## Decorations

Style primitives passed to cells — `Adapters` decide how to apply them. Just more meta for you to render with.

- `Color` — RGBA color, construct from hex or object
- `Spacing` — padding/margin with `all`, `symmetric`, or `only`
- `Border` — border width and color
- `BoxDecoration` — wraps border (and future decoration props)
- `Alignment` — horizontal or vertical layout direction with justify/items
- `Size` — named size tokens: `xs`, `s`, `m`, `l`, `xl`

## Renderers

`Adapters` must implement a single `render(cell)` method and return content in whatever format they need. The framework makes no assumptions about output format.

## Status

Work in progress. API subject to change.
