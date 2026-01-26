import { Duplex } from 'streamx'
import { Writable } from 'streamx'

class Matcher extends Duplex {
  patterns = []

  constructor() {
    super()
  }

  add(pattern, handler) {
    this.patterns.push({ pattern, handler })
    return this
  }

  _write(data) {
    console.log('matcher', data)
    for (const { pattern, handler } of this.patterns) {
      if (this._match(data, pattern)) {
        handler(data)
      }
    }
  }

  _match(message, pattern) {
    if (typeof pattern !== 'object' || pattern === null) return false
    for (const key in pattern) {
      if (Object.hasOwn(pattern, key) === false) continue
      if (Object.hasOwn(message, key) === false) return false
      const messageValue = message[key]
      const patternValue = pattern[key]
      const nested =
        typeof patternValue === 'object' &&
        patternValue !== null &&
        typeof messageValue === 'object' &&
        messageValue !== null
      if (nested) {
        if (this._match(messageValue, patternValue) === false) return false
      } else if (messageValue !== patternValue) {
        return false
      }
    }
    return true
  }
}

export { Matcher }
