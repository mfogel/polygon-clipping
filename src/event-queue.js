const TinyQueue = require('tinyqueue')
const Segment = require('./segment')
const SweepEvent = require('./sweep-event')
const { arePointsEqual } = require('./point')
const operationTypes = require('./operation-types')

class EventQueue {
  constructor (comparator = SweepEvent.compare) {
    this.tinyQueue = new TinyQueue(null, comparator)
    this.ringId = 0
  }

  consume (multipoly, isSubject) {
    multipoly.forEach(poly => {
      poly.forEach((ring, j) => {
        // TODO: this is suspicious
        const isExteriorRing =
          !isSubject && operationTypes.isActive(operationTypes.DIFFERENCE)
            ? false
            : j === 0
        if (isExteriorRing) this.ringId++

        ring.forEach((point, i, ring) => {
          if (i === 0) return
          const prevPoint = ring[i - 1]

          // repeated point in a ring? Skip over it
          if (arePointsEqual(prevPoint, point)) return

          const seg = new Segment(prevPoint, point, isSubject)

          // TODO: if this info is needed, SweepEvent constructor should accept it
          seg.leftSE.ringId = seg.rightSE.ringId = this.ringId
          seg.leftSE.isExteriorRing = seg.rightSE.isExteriorRing = isExteriorRing

          this.push(seg.leftSE, seg.rightSE)
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

  isEmpty () {
    return this.tinyQueue.length === 0
  }

  getLength () {
    return this.tinyQueue.length
  }
}

module.exports = EventQueue
