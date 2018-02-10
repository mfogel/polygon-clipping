const { isInBbox, getBboxOverlap, getUniqueCorners } = require('./bbox')
const { arePointsEqual, crossProduct } = require('./point')
const SweepEvent = require('./sweep-event')

class Segment {
  // TODO: this needs:
  //  * a solid test suite
  //  * some rounds of simplification
  static compare (a, b) {
    if (a === b) return 0

    if (!a.isColinearWith(b)) {
      // If they share their left endpoint use the right endpoint to sort
      if (a.leftSE.hasSamePoint(b.leftSE)) {
        return a.isPointBelow(b.rightSE.point) ? -1 : 1
      }

      // Different left endpoint: use the left endpoint to sort
      if (a.leftSE.point[0] === b.leftSE.point[0]) {
        return a.leftSE.point[1] < b.leftSE.point[1] ? -1 : 1
      }

      // has the line segment associated to e1 been inserted
      // into S after the line segment associated to e2 ?
      if (SweepEvent.compare(a.leftSE, b.leftSE) === 1) {
        return !b.isPointBelow(a.leftSE.point) ? -1 : 1
      }

      // The line segment associated to e2 has been inserted
      // into S after the line segment associated to e1
      return a.isPointBelow(b.leftSE.point) ? -1 : 1
    }

    if (a.isSubject === b.isSubject) {
      // same polygon
      if (a.leftSE.hasSamePoint(b.leftSE)) {
        if (a.rightSE.hasSamePoint(b.rightSE)) return 0
        else return a.leftSE.ringId > b.leftSE.ringId ? 1 : -1
      }
    } else {
      // Segments are collinear, but belong to separate polygons
      return a.isSubject ? -1 : 1
    }

    return SweepEvent.compare(a.leftSE, b.leftSE) === 1 ? 1 : -1
  }

  constructor (point1, point2, isSubject) {
    if (arePointsEqual(point1, point2)) {
      throw new Error('Unable to build segment for identical points')
    }

    this.isSubject = isSubject

    const [lp, rp] = [point1, point2].sort(SweepEvent.comparePoints)
    this.leftSE = new SweepEvent(lp, this)
    this.rightSE = new SweepEvent(rp, this)
  }

  clone () {
    return new Segment(this.leftSE.point, this.rightSE.point, this.isSubject)
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

  isPointOn (point) {
    return isInBbox(this.bbox, point) && this.isPointColinear(point)
  }

  isCoincidentWith (other) {
    return (
      arePointsEqual(this.leftSE.point, other.leftSE.point) &&
      arePointsEqual(this.rightSE.point, other.rightSE.point)
    )
  }

  isColinearWith (other) {
    return other.points.every(pt => this.isPointColinear(pt))
  }

  isPointBelow (point) {
    return this._compareWithPoint(point) > 0
  }

  isPointColinear (point) {
    return this._compareWithPoint(point) === 0
  }

  isPointAbove (point) {
    return this._compareWithPoint(point) < 0
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

    // The general algorithim doesn't handle overlapping colinear segments.
    // Overlapping colinear segments, if present, will have intersections
    // of one pair of opposing corners of the bbox overlap. Thus we just
    // manually check those coordinates.
    //
    // Note this also handles the cases of a collapsed (just one point)
    // bbox and semi-collapsed (a vertical or horizontal line) as well.
    const isOnBoth = pt => this.isPointOn(pt) && other.isPointOn(pt)
    const intersections = getUniqueCorners(bboxOverlap).filter(isOnBoth)
    if (intersections.length > 0) return intersections

    // General case for non-overlapping segments.
    // This algorithm is based on Schneider and Eberly.
    // http://www.cimec.org.ar/~ncalvo/Schneider_Eberly.pdf - pg 244
    const [a1, a2, b1, b2] = [...this.points, ...other.points]
    const [va, vb] = [this.vector, other.vector]
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

  /**
   * Attempt to split the given segment into two segments on the given point.
   * If the given point is not along the interior of the segment, the split will
   * not be possible and an empty array will be returned.
   * If the point is not on an endpoint, the segment will be split.
   *  * The existing segment will retain it's leftSE and a new rightSE will be
   *    generated for it.
   *  * A new segment will be generated which will adopt the original segment's
   *    rightSE, and a new leftSE will be generated for it.
   *  * An array of the two new generated SweepEvents, one from each segment,
   *    will be returned.
   */
  attemptSplit (point) {
    if (this.isAnEndpoint(point) || !this.isPointOn(point)) return []

    const newSeg = this.clone()

    newSeg.leftSE = new SweepEvent(point, newSeg)
    newSeg.rightSE = this.rightSE
    this.rightSE.segment = newSeg

    this.rightSE = new SweepEvent(point, this)

    // TODO: deal with this
    this.rightSE.ringId = newSeg.leftSE.ringId = this.leftSE.ringId
    // FIXME: this breaks the tests. It shouldn't.
    // r.isExteriorRing = l.isExteriorRing = se.isExteriorRing

    return [this.rightSE, newSeg.leftSE]
  }

  _compareWithPoint (point) {
    let va = [point[0] - this.points[0][0], point[1] - this.points[0][1]]
    let vb = [point[0] - this.points[1][0], point[1] - this.points[1][1]]
    const kross = crossProduct(va, vb)
    if (kross * kross < Number.EPSILON * Number.EPSILON) return 0
    return kross > 0 ? 1 : -1
  }
}

module.exports = Segment
