const divideSegment = require('./divide-segment')
const { arePointsEqual } = require('./point')
const SweepEvent = require('./sweep-event')

/**
 * Returns true two intersections are found, and one of them
 * is on the left endpoint of se1.
 * Returns false in all other cases.
 */
module.exports = (se1, se2, queue) => {
  // that disallows self-intersecting polygons,
  // did cost us half a day, so I'll leave it
  // out of respect
  // if (se1.isSubject === se2.isSubject) return;
  const inters = se1.segment.getIntersections(se2.segment)

  if (inters.length === 1) {
    const intersection = inters[0]
    // if the intersection point is not an endpoint of se1
    if (!se1.segment.isAnEndpoint(intersection)) {
      divideSegment(se1, intersection, queue)
    }

    // if the intersection point is not an endpoint of se2
    if (!se2.segment.isAnEndpoint(intersection)) {
      divideSegment(se2, intersection, queue)
    }
  }

  if (inters.length === 2) {
    // The line segments associated to se1 and se2 are colinear and overlap
    const leftCoincide = arePointsEqual(se1.point, se2.point)
    const rightCoincide = arePointsEqual(se1.otherSE.point, se2.otherSE.point)

    if (!rightCoincide) {
      const [e1, e2] = [se1.otherSE, se2.otherSE].sort(SweepEvent.compare)
      divideSegment(e2.otherSE, e1.point, queue)
    }

    if (!leftCoincide) {
      const [e1, e2] = [se1, se2].sort(SweepEvent.compare)
      divideSegment(e1, e2.point, queue)
    }
  }
}
