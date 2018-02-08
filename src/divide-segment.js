const Segment = require('./segment')
const SweepEvent = require('./sweep-event')
const { arePointsEqual } = require('./point')

// TODO: move all these writes to Segment internals within the class

module.exports = function divideSegment (se, p, queue) {
  // construct with throwaway points
  const newSeg = new Segment([0, 0], [1, 1])

  const l = new SweepEvent(p, se.isSubject, newSeg)
  newSeg.leftSE = l
  newSeg.rightSE = se.otherSE
  se.otherSE.segment = newSeg

  const r = new SweepEvent(p, se.isSubject, se.segment)
  se.segment.rightSE = r

  if (arePointsEqual(se.point, se.otherSE.point)) {
    console.warn('what is that, a collapsed segment?', se)
  }

  r.ringId = l.ringId = se.ringId
  // FIXME: this breaks the tests. It shouldn't.
  // r.isExteriorRing = l.isExteriorRing = se.isExteriorRing

  queue.push(l, r)
  return queue
}
