# Lyse

> **WIP** - A deliberately simple cross-platform UI framework

Lyse is a minimalist framework for building terminal user interfaces. It keeps component internals simple while allowing renderers flexibility in how they display content. The framework provides essential building blocks called "Cells" - stateless, minimal components that renderers implement to allow complex applications to be built through composition.

Core philosophy: cells are stateless and minimal, renderers handle display, applications control behavior.

## Why?

GUI, TUI, mobile, browser - all have unique needs. Rather than trying to solve all of these, `Lyse` lets you build functional components, similar to Flutter. Renderers can then choose to implement as much or as little as needed for their use case.

Want to render to eInk? Native components rather than React Native? TUI? Implement the `Cells` as you need for your use case while targetting a consistent UX across devices.

## Name

**Lyse** has dual meaning:

**Old Norse/Old Danish**: "to give light" or "to illuminate" - bringing clarity to terminal interfaces through simplicity.

**Biology**: Cell lysis - the breaking down of cells into their fundamental components. Just as lysis reveals the essential building blocks of life, Lyse breaks down UI into minimal, composable cells.

## Status

Work in progress. API subject to change.
