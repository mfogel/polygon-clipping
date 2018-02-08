const TinyQueue = require('tinyqueue')
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

          const [e1, e2] = SweepEvent.buildPair(prevPoint, point, isSubject)

          // TODO: if this info is needed, SweepEvent constructor should accept it
          e1.ringId = e2.ringId = this.ringId
          e1.isExteriorRing = e2.isExteriorRing = isExteriorRing

          this.push(e1, e2)
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
