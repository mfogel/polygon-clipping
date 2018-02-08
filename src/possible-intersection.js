const divideSegment = require('./divide-segment')
const intersection = require('./segment-intersection')
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
  const inters = intersection(
    se1.point,
    se1.otherSE.point,
    se2.point,
    se2.otherSE.point
  )

  if (inters.length === 1) {
    // if the intersection point is not an endpoint of se1
    if (
      !arePointsEqual(se1.point, inters[0]) &&
      !arePointsEqual(se1.otherSE.point, inters[0])
    ) {
      divideSegment(se1, inters[0], queue)
    }

    // if the intersection point is not an endpoint of se2
    if (
      !arePointsEqual(se2.point, inters[0]) &&
      !arePointsEqual(se2.otherSE.point, inters[0])
    ) {
      divideSegment(se2, inters[0], queue)
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

    if (leftCoincide) {
      se1.registerCoincidentEvent(se2, true)
      se2.registerCoincidentEvent(se1, false)
    }
  }
}
