const SweepEvent = require('./sweep-event')
const equals = require('./equals')

module.exports = function divideSegment (se, p, queue) {
  const r = new SweepEvent(p, false, se, se.isSubject)
  const l = new SweepEvent(p, true, se.otherEvent, se.isSubject)

  if (equals(se.point, se.otherEvent.point)) {
    console.warn('what is that, a collapsed segment?', se)
  }

  r.contourId = l.contourId = se.contourId

  // avoid a rounding error. The left event would be processed after the right event
  // if (compareEvents(l, se.otherEvent) > 0) {
  //   se.otherEvent.isLeft = true
  //   l.isLeft = false
  // }

  // avoid a rounding error. The left event would be processed after the right event
  // if (compareEvents(se, r) > 0) {}

  se.otherEvent.otherEvent = l
  se.otherEvent = r

  queue.push(l)
  queue.push(r)

  return queue
}
