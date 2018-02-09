const { getBboxOverlap, getOtherCorners } = require('./bbox')
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

  get xmin () {
    return this.leftSE.point[0]
  }
  get xmax () {
    return this.rightSE.point[0]
  }
  get ymin () {
    return Math.min(this.leftSE.point[1], this.rightSE.point[1])
  }
  get ymax () {
    return Math.max(this.leftSE.point[1], this.rightSE.point[1])
  }

  get bbox () {
    return [[this.xmin, this.ymin], [this.xmax, this.ymax]]
  }

  /* A vector from the left point to the right */
  get vector () {
    return [
      this.rightSE.point[0] - this.leftSE.point[0],
      this.rightSE.point[1] - this.leftSE.point[1]
    ]
  }

  get isVertical () {
    return this.leftSE.point[0] === this.rightSE.point[0]
  }

  get isHorizontal () {
    return this.leftSE.point[1] === this.rightSE.point[1]
  }

  /* an array of left point, right point */
  get points () {
    return [this.leftSE.point, this.rightSE.point]
  }

  getOtherSE (se) {
    if (se === this.leftSE) return this.rightSE
    if (se === this.rightSE) return this.leftSE
    throw new Error('may only be called by own sweep events')
  }

  isAnEndpoint (point) {
    return this.points.some(pt => arePointsEqual(pt, point))
  }

  /**
   * Given another segment, returns an array of intersection points
   * representing the overlap, if it exists, between the two segments.
   * The overlap will be an array of two points, ordered as the
   * sweep line would encounter them.
   * If no overlap exists, null will be returned.
   * If the two segments intersect at just a point, they are not
   * considered to be overlapping.
   */
  getOverlap (other) {
    // If bboxes don't overlap, there can't be any overlap
    const bboxOverlap = getBboxOverlap(this.bbox, other.bbox)
    if (bboxOverlap === null) return null

    // parallel segments that aren't colinear can't intersect
    if (!arePointsColinear(...this.points, ...other.points)) return null

    // colinear segments that have bboxes that overlap on just a point
    // only intersect at that point - there's no overlap
    if (arePointsEqual(bboxOverlap[0], bboxOverlap[1])) return null

    // We have colinear segments with overlapping bboxes - thus the
    // segments overlap. The only question is which two oposing corners
    // of the bbox overlap represent the segment overlap.
    const goesUpAndToTheRight = this.leftSE.point[1] <= this.rightSE.point[1]
    return goesUpAndToTheRight ? bboxOverlap : getOtherCorners(bboxOverlap)
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
    // If bboxes don't overlap, there can't be any intersections
    const bboxOverlap = getBboxOverlap(this.bbox, other.bbox)
    if (bboxOverlap === null) return []

    const [va, vb] = [this.vector, other.vector]

    if (areVectorsParallel(va, vb)) {
      const overlap = this.getOverlap(other)
      if (overlap !== null) return overlap

      // check to see if they just touch on an endpoint
      if (this.isAnEndpoint(other.leftSE.point)) return [other.leftSE.point]
      if (this.isAnEndpoint(other.rightSE.point)) return [other.rightSE.point]
    }

    // General case with non-parallel segments.
    const [a1, a2, b1, b2] = [...this.points, ...other.points]
    const ve = [b1[0] - a1[0], b1[1] - a1[1]]
    const kross = crossProduct(va, vb)

    // not on line segment a
    const s = crossProduct(ve, vb) / kross
    if (s < 0 || s > 1) return []

    // on an endpoint of line segment a
    if (s === 0) return [a1]
    if (s === 1) return [a2]

    // not on line segment b
    const t = crossProduct(ve, va) / kross
    if (t < 0 || t > 1) return []

    // on an endpoint of line segment b
    if (t === 0) return [b1]
    if (t === 1) return [b2]

    // intersection is in a midpoint of both lines, let's use a
    return [[a1[0] + s * va[0], a1[1] + s * va[1]]]
  }
}

module.exports = Segment
