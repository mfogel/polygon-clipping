const { getBbox, getBboxOverlap, getOtherCorners } = require('./bbox')
const {
  arePointsColinear,
  arePointsEqual,
  areVectorsParallel,
  crossProduct
} = require('./point')
const SweepEvent = require('./sweep-event')

class Segment {
  constructor (point1, point2, isSubject) {
    if (arePointsEqual(point1, point2)) {
      throw new Error('Unable to build segment for identical points')
    }

    this.isSubject = isSubject

    const [lp, rp] = [point1, point2].sort(SweepEvent.comparePoints)
    this.leftSE = new SweepEvent(lp, this)
    this.rightSE = new SweepEvent(rp, this)
  }

  getOtherSE (se) {
    if (se === this.leftSE) return this.rightSE
    if (se === this.rightSE) return this.leftSE
    throw new Error('may only be called by own sweep events')
  }

  isAnEndpoint (point) {
    return (
      arePointsEqual(this.leftSE.point, point) ||
      arePointsEqual(this.rightSE.point, point)
    )
  }

  /**
   * Given another segment, returns an array of intersection points
   * between the two segments. The returned array can contain:
   *  * zero points:  no intersection b/t segments
   *  * one point:    segments intersect once
   *  * two points:   segments overlap. Endpoints of overlap returned.
   *                  Will be ordered as sweep line would encounter them.
   */
  getIntersections (other) {
    const [a1, a2] = [this.leftSE.point, this.rightSE.point]
    const [b1, b2] = [other.leftSE.point, other.rightSE.point]

    // If bboxes don't overlap, there can't be any intersections
    const [aBbox, bBbox] = [getBbox(a1, a2), getBbox(b1, b2)]
    const bboxOverlap = getBboxOverlap(aBbox, bBbox)
    if (bboxOverlap === null) return []

    const va = [a2[0] - a1[0], a2[1] - a1[1]]
    const vb = [b2[0] - b1[0], b2[1] - b1[1]]

    if (areVectorsParallel(va, vb)) {
      // parallel segments that aren't colinear can't intersect
      if (!arePointsColinear(a1, a2, b1, b2)) return []

      // colinear segments with just a point of bbox overlap
      // that point must be the one and only intersection
      if (arePointsEqual(...bboxOverlap)) return [bboxOverlap[0]]

      // We have colinear segments with overlap - thus two intersections.
      // The only question is which two oposing corners of the overlap bbox
      // are the intersections.
      const goesUpAndToTheRight = aBbox.some(pt => arePointsEqual(a1, pt))
      return goesUpAndToTheRight ? bboxOverlap : getOtherCorners(bboxOverlap)
    }

    // General case with non-parallel segments.
    const krossVaVb = crossProduct(va, vb)
    const ve = [b1[0] - a1[0], b1[1] - a1[1]]

    // not on line segment a
    const s = crossProduct(ve, vb) / krossVaVb
    if (s < 0 || s > 1) return []

    // on an endpoint of line segment a
    if (s === 0) return [a1]
    if (s === 1) return [a2]

    // not on line segment b
    const t = crossProduct(ve, va) / krossVaVb
    if (t < 0 || t > 1) return []

    // on an endpoint of line segment b
    if (t === 0) return [b1]
    if (t === 1) return [b2]

    // intersection is in a midpoint of both lines, let's use a
    return [[a1[0] + s * va[0], a1[1] + s * va[1]]]
  }
}

module.exports = Segment
