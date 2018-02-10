const SweepEvent = require('./sweep-event')
const { arePointsColinear } = require('./point')

module.exports = function compareSegments (le1, le2) {
  if (le1 === le2) return 0

  const pts = [le1.point, le1.otherSE.point, le2.point, le2.otherSE.point]
  const [seg1, seg2] = [le1.segment, le2.segment]

  if (!arePointsColinear(...pts)) {
    // If they share their left endpoint use the right endpoint to sort
    if (le1.hasSamePoint(le2)) {
      return seg1.isPointBelow(le2.otherSE.point) ? -1 : 1
    }

    // Different left endpoint: use the left endpoint to sort
    if (le1.point[0] === le2.point[0]) {
      return le1.point[1] < le2.point[1] ? -1 : 1
    }

    // has the line segment associated to e1 been inserted
    // into S after the line segment associated to e2 ?
    if (SweepEvent.compare(le1, le2) === 1) {
      return !seg2.isPointBelow(le1.point) ? -1 : 1
    }

    // The line segment associated to e2 has been inserted
    // into S after the line segment associated to e1
    return seg1.isPointBelow(le2.point) ? -1 : 1
  }

  if (le1.isSubject === le2.isSubject) {
    // same polygon
    if (le1.hasSamePoint(le2)) {
      if (le1.otherSE.hasSamePoint(le2.otherSE)) return 0
      else return le1.ringId > le2.ringId ? 1 : -1
    }
  } else {
    // Segments are collinear, but belong to separate polygons
    return le1.isSubject ? -1 : 1
  }

  return SweepEvent.compare(le1, le2) === 1 ? 1 : -1
}
