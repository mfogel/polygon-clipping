const divideSegment = require('./divide-segment')
const { arePointsEqual } = require('./point')
const SweepEvent = require('./sweep-event')

/**
 * Returns an Array of new events generated, if any
 */
module.exports = (se1, se2) => {
  // that disallows self-intersecting polygons,
  // did cost us half a day, so I'll leave it
  // out of respect
  // if (se1.isSubject === se2.isSubject) return;
  const inters = se1.segment.getIntersections(se2.segment)
  const newEvents = []

  if (inters.length === 1) {
    const intersection = inters[0]
    // if the intersection point is not an endpoint of se1
    if (!se1.segment.isAnEndpoint(intersection)) {
      newEvents.push(...divideSegment(se1, intersection))
    }

    // if the intersection point is not an endpoint of se2
    if (!se2.segment.isAnEndpoint(intersection)) {
      newEvents.push(...divideSegment(se2, intersection))
    }
  }

  if (inters.length === 2) {
    // The line segments associated to se1 and se2 are colinear and overlap
    const leftCoincide = arePointsEqual(se1.point, se2.point)
    const rightCoincide = arePointsEqual(se1.otherSE.point, se2.otherSE.point)

    if (!rightCoincide) {
      const [e1, e2] = [se1.otherSE, se2.otherSE].sort(SweepEvent.compare)
      newEvents.push(...divideSegment(e2.otherSE, e1.point))
    }

    if (!leftCoincide) {
      const [e1, e2] = [se1, se2].sort(SweepEvent.compare)
      newEvents.push(...divideSegment(e1, e2.point))
    }
  }

  return newEvents
}
