const SweepEvent = require('./sweep-event')
const { arePointsEqual } = require('./point')

// TODO: move all these writes to SweepEvent internals within the class

module.exports = function divideSegment (se, p, queue) {
  const l = new SweepEvent(p, se.isSubject, true)
  l.otherEvent = se.otherEvent
  se.otherEvent.otherEvent = l

  const r = new SweepEvent(p, se.isSubject, false)
  r.otherEvent = se
  se.otherEvent = r

  if (arePointsEqual(se.point, se.otherEvent.point)) {
    console.warn('what is that, a collapsed segment?', se)
  }

  r.contourId = l.contourId = se.contourId
  // FIXME: this breaks the tests. It shouldn't.
  // r.isExteriorRing = l.isExteriorRing = se.isExteriorRing

  queue.push(l)
  queue.push(r)

  return queue
}
