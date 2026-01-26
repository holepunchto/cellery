import { Readable, Writable } from 'streamx'

export default class Broadcast {
  constructor() {
    this.peers = new Map()
  }

  connect(peer, opts = {}) {
    const encoding = opts.encoding || null
    const self = this

    const r = new Readable({
      map: encoding ? encoding.encode : undefined
    })

    const w = new Writable({
      map: encoding ? encoding.decode : undefined,
      write(data, cb) {
        self._send(data, peer)
        cb(null)
      }
    })

    this.peers.set(peer, { r, w })

    r.pipe(peer)
    peer.pipe(w)

    return this
  }

  disconnect(peer) {
    const entry = this.peers.get(peer)
    if (!entry) return this

    entry.r.destroy()
    entry.w.destroy()
    this.peers.delete(peer)

    return this
  }

  send(data) {
    for (const [, { r }] of this.peers) {
      r.push(data)
    }
  }

  _send(data, source) {
    for (const [peer, { r }] of this.peers) {
      if (peer !== source) {
        r.push(data)
      }
    }
  }

  destroy(err) {
    for (const [, { r, w }] of this.peers) {
      r.destroy(err)
      w.destroy(err)
    }
    this.peers.clear()
  }
}
