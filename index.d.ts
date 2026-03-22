declare module 'cellery' {
  import Iambus from 'iambus'

  // --- Decorations ---

  export class Alignment {
    direction: string
    justify: string
    items: string

    constructor(direction: string, justify: string, items: string)

    static Horizontal(opts: { justify?: string; items?: string }): Alignment
    static Vertical(opts: { justify?: string; items?: string }): Alignment
  }

  export class Spacing {
    left: number
    top: number
    right: number
    bottom: number

    constructor(left: number, top: number, right: number, bottom: number)

    static all(value: number): Spacing
    static symmetric(opts: { vertical?: number; horizontal?: number }): Spacing
    static only(opts: { left?: number; right?: number; top?: number; bottom?: number }): Spacing

    toString(): string
  }

  export class Color {
    red: number
    green: number
    blue: number
    alpha: number

    constructor(red?: number, green?: number, blue?: number, alpha?: number)

    toString(): string
    toRGBA(): string
    toRGB(): string

    static from(
      value: string | { red?: number; green?: number; blue?: number; alpha?: number },
      alpha?: number
    ): Color | null
  }

  export interface BorderOptions {
    width?: number
    color?: Color | null
  }

  export class Border {
    width: number
    color: Color | null

    constructor(opts?: BorderOptions)

    static all(opts?: BorderOptions): Border

    toString(): string
  }

  export interface BoxDecorationOptions {
    border?: Border | null
  }

  export class BoxDecoration {
    border: Border | null

    constructor(opts?: BoxDecorationOptions)

    toString(): string
  }

  export const Size: {
    readonly XS: 'xs'
    readonly S: 's'
    readonly M: 'm'
    readonly L: 'l'
    readonly XL: 'xl'
  }

  export type SizeValue = (typeof Size)[keyof typeof Size]

  // --- Cells ---

  export interface CellOptions {
    id?: string
    children?: Cell[] // lunte-disable-line
    cellery?: Cellery // lunte-disable-line
    padding?: Spacing
    margin?: Spacing
    color?: Color
    alignment?: Alignment
    decoration?: BoxDecoration
    size?: SizeValue
    onclick?: (...args: any[]) => void
  }

  export class Cell {
    id: string | undefined
    children: Cell[]
    cellery: Cellery | undefined // lunte-disable-line
    padding: Spacing | undefined
    margin: Spacing | undefined
    color: Color | undefined
    alignment: Alignment | undefined
    decoration: BoxDecoration | undefined
    size: SizeValue | undefined
    onclick: ((...args: any[]) => void) | undefined

    constructor(opts?: CellOptions)

    static Styled<T extends typeof Cell>(this: T, styledOpts?: CellOptions): T

    sub(pattern: any, cb: (cell: this, data: any) => void): void

    _render(): this
    render(opts?: Record<string, any>): void
    destroy(): void
  }

  export interface ContainerOptions extends CellOptions {
    scroll?: string
    flex?: string
  }

  export class Container extends Cell {
    static ScrollAll: 'all'
    static ScrollVertical: 'vertical'
    static ScrollHorizontal: 'horizontal'
    static ScrollNone: 'none'
    static FlexAuto: 'auto'
    static FlexNone: 'none'

    scroll: string
    flex: string

    constructor(opts?: ContainerOptions) // lunte-disable-line
  }

  export class App extends Cell {
    constructor(opts?: Omit<CellOptions, 'id'>) // lunte-disable-line
  }

  export interface TextOptions extends CellOptions {
    value?: string
  }

  export class Text extends Cell {
    value: string

    constructor(opts?: TextOptions) // lunte-disable-line
  }

  export class Paragraph extends Cell {
    constructor(opts?: CellOptions) // lunte-disable-line
  }

  export interface InputOptions extends CellOptions {
    multiline?: boolean
    placeholder?: string
    type?: string
  }

  export class Input extends Cell {
    multiline: boolean
    placeholder: string | undefined
    type: string

    constructor(opts?: InputOptions) // lunte-disable-line
  }

  // --- Adapter ---

  export interface Adapter {
    render(cell: Cell): any
  }

  // --- Cellery ---

  export class Cellery extends Iambus {
    app: App
    adapter: Adapter

    constructor(app: App, adapter: Adapter) // lunte-disable-line

    write(data: any): void
    on(type: string, cb: (...args: any[]) => void): void
    emit(type: string, stream: any): void
    render(): void
  }
}
