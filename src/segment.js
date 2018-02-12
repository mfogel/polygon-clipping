const { isInBbox, getBboxOverlap, getUniqueCorners } = require('./bbox')
const { arePointsEqual, crossProduct } = require('./point')
const SweepEvent = require('./sweep-event')

// Give segments unique ID's to get consistent sorting when segments
// are otherwise identical
let creationCnt = 0

class Segment {
  static compare (a, b) {
    if (a === b) return 0

    const [[alx, aly], [blx, bly]] = [a.leftSE.point, b.leftSE.point]
    const [arx, brx] = [a.rightSE.point[0], b.rightSE.point[0]]

    // check if they're even in the same vertical plane
    if (alx > brx) return 1
    if (blx > arx) return -1

    if (a.isColinearWith(b)) {
      // colinear segments with non-matching left-endpoints, consider
      // the more-left endpoint to be earlier
      if (alx !== blx) return alx < blx ? -1 : 1

      // colinear segments with matching left-endpoints, fall back
      // on creation order of segments as a tie-breaker
      // NOTE: we do not use segment length to break a tie here, because
      //       when segments are split their length changes
      if (a.creationId !== b.creationId) {
        return a.creationId < b.creationId ? -1 : 1
      }
    } else {
      // for non-colinear segments with matching left endoints,
      // consider the one that angles more downward to be earlier
      if (arePointsEqual(a.leftSE.point, b.leftSE.point)) {
        return a.isPointBelow(b.rightSE.point) ? -1 : 1
      }

      // their left endpoints are in the same vertical line, lower means ealier
      if (alx === blx) return aly < bly ? -1 : 1

      // along a vertical line at the rightmore of the two left endpoints,
      // consider the segment that intersects lower with that line to be earlier
      if (alx < blx) return a.isPointBelow(b.leftSE.point) ? -1 : 1
      if (alx > blx) return b.isPointBelow(a.leftSE.point) ? 1 : -1
    }

    throw new Error('Segment comparison failed... identical but not?')
  }

  constructor (point1, point2, isSubject, creationId = null) {
    if (arePointsEqual(point1, point2)) {
      throw new Error('Unable to build segment for identical points')
    }

    this.creationId = creationId === null ? creationCnt++ : creationId
    this.isSubject = isSubject

    const [lp, rp] = [point1, point2].sort(SweepEvent.comparePoints)
    this.leftSE = new SweepEvent(lp, this)
    this.rightSE = new SweepEvent(rp, this)
  }

  clone () {
    // A cloned segment gets the same creationId as the parent.
    // This is to keep sorting consistent when segments are split
    return new Segment(
      this.leftSE.point,
      this.rightSE.point,
      this.isSubject,
      this.creationId
    )
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
