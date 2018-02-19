const TinyQueue = require('tinyqueue')
const Segment = require('./segment')
const SweepEvent = require('./sweep-event')
const { arePointsEqual } = require('./point')

class EventQueue {
  constructor (comparator = SweepEvent.compare) {
    this.tinyQueue = new TinyQueue(null, comparator)
  }

  consume (multipolys) {
    let polyId = 0

    multipolys.forEach(multipoly => {
      multipoly.forEach(poly => {
        poly.forEach((ring, j) => {
          ring.forEach((point, i, ring) => {
            if (i === 0) return
            const prevPoint = ring[i - 1]

            // repeated point in a ring? Skip over it
            if (arePointsEqual(prevPoint, point)) return

            const seg = new Segment(prevPoint, point, polyId)
            this.push(seg.leftSE, seg.rightSE)
          })
        })

        polyId += 1
      })
    })
  }

  push (...events) {
    events.forEach(evt => this.tinyQueue.push(evt))
  }

  pop () {
    return this.tinyQueue.pop()
  }

  get isEmpty () {
    return this.tinyQueue.length === 0
  }
}

module.exports = EventQueue
