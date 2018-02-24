const TinyQueue = require('tinyqueue')
const geomIn = require('./geom-in')
const Segment = require('./segment')
const SweepEvent = require('./sweep-event')
const { arePointsEqual } = require('./flp')

class EventQueue {
  constructor (comparator = SweepEvent.compare) {
    this.tinyQueue = new TinyQueue(null, comparator)
  }

  consume (multipolys) {
    multipolys.forEach(multipoly => {
      const multiPolyGeom = new geomIn.MultiPoly()

      multipoly.forEach(poly => {
        const polyGeom = new geomIn.Poly(multiPolyGeom)

        poly.forEach((ring, j) => {
          const ringGeom = new geomIn.Ring(polyGeom, j === 0)

          ring.forEach((point, i, ring) => {
            if (i === 0) return
            const prevPoint = ring[i - 1]

            // repeated point in a ring? Skip over it
            if (arePointsEqual(prevPoint, point)) return

            const seg = new Segment(prevPoint, point, ringGeom)
            this.push(seg.leftSE, seg.rightSE)
          })
        })
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
