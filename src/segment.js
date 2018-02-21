const operation = require('./operation')
const SweepEvent = require('./sweep-event')
const { isInBbox, getBboxOverlap, getUniqueCorners } = require('./bbox')
const { arePointsEqual, crossProduct } = require('./point')

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

  constructor (point1, point2, ring, creationId = null) {
    if (arePointsEqual(point1, point2)) {
      throw new Error('Unable to build segment for identical points')
    }

    this.creationId = creationId !== null ? creationId : creationCnt++
    this.ringIn = ring
    this.ringOut = null

    const [lp, rp] = [point1, point2].sort(SweepEvent.comparePoints)
    this.leftSE = new SweepEvent(lp, this)
    this.rightSE = new SweepEvent(rp, this)

    this.coincidents = [this]

    // cache of dynamically computed properies
    this._clearCache()
  }

  clone () {
    // A cloned segment gets the same creationId as the parent.
    // This is to keep sorting consistent when segments are split
    return new Segment(
      this.leftSE.point,
      this.rightSE.point,
      this.ringIn,
      this.creationId
    )
  }

  registerRingOut (ring) {
    this.ringOut = ring
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

  getOtherPoint (point) {
    if (arePointsEqual(point, this.leftSE.point)) return this.rightSE.point
    if (arePointsEqual(point, this.rightSE.point)) return this.leftSE.point
    throw new Error('may only be called with own point')
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

  _compareWithPoint (point) {
    let va = [point[0] - this.points[0][0], point[1] - this.points[0][1]]
    let vb = [point[0] - this.points[1][0], point[1] - this.points[1][1]]
    const kross = crossProduct(va, vb)
    if (kross * kross < Number.EPSILON * Number.EPSILON) return 0
    return kross > 0 ? 1 : -1
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
    // Note this also handles the cases of a collapsed bbox (just one point)
    // and semi-collapsed bbox (a vertical or horizontal line) as well.
    //
    // In addition, in the case of a T-intersection, this ensures that the
    // interseciton returned matches exactly an endpoint - no rounding error.
    const isOnBoth = pt => this.isPointOn(pt) && other.isPointOn(pt)
    const intersections = getUniqueCorners(bboxOverlap).filter(isOnBoth)
    if (intersections.length > 0) return intersections

    // General case for non-overlapping segments.
    // This algorithm is based on Schneider and Eberly.
    // http://www.cimec.org.ar/~ncalvo/Schneider_Eberly.pdf - pg 244
    const [al, bl] = [this.leftSE.point, other.leftSE.point]
    const [va, vb] = [this.vector, other.vector]
    const ve = [bl[0] - al[0], bl[1] - al[1]]
    const kross = crossProduct(va, vb)

    // not on line segment a
    const s = crossProduct(ve, vb) / kross
    if (s < 0 || s > 1) return []

    // not on line segment b
    const t = crossProduct(ve, va) / kross
    if (t < 0 || t > 1) return []

    // intersection is in a midpoint of both lines, let's use a
    return [[al[0] + s * va[0], al[1] + s * va[1]]]
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

    return [this.rightSE, newSeg.leftSE]
  }

  registerPrev (other) {
    this.prev = other
    this._clearCache()
  }

  registerCoincidence (other) {
    this.coincidents.push(...other.coincidents)
    this.coincidents = Array.from(new Set(this.coincidents))
    other.coincidents = this.coincidents
  }

  get isCoincident () {
    return this.coincidents.length > 1
  }

  get isCoincidenceWinner () {
    // arbitary - winner is the one with lowest creationId
    const creationIds = this.coincidents.map(seg => seg.creationId)
    return this.creationId === Math.min(...creationIds)
  }

  // TODO: s/Ring/Poly/
  get coincidentsSweepLineEntersRingAllMatch () {
    const values = this.coincidents.map(c => c.sweepLineEntersRing)
    return values.every(v => v === this.sweepLineEntersRing)
  }

  /* Is this segment inside all the other input multipolys? */
  get isInsideAllOthers () {
    return this.otherMultiPolysInsideOf.length === operation.numberOfGeoms - 1
  }

  /* Is this segment outside all the other input multipolys? */
  get isOutsideAllOthers () {
    return this.otherMultiPolysInsideOf.length === 0
  }

  /* Does the sweep line, when it intersects this segment, enter or exit the ring? */
  get sweepLineEntersRing () {
    return this._getCached('sweepLineEntersRing')
  }

  /* Array of input rings this segments is inside of, not including own ring. */
  get otherRingsInsideOf () {
    return this._getCached('otherRingsInsideOf')
  }

  /* Array of polys this segments is inside of, not including it's own. */
  get otherPolysInsideOf () {
    return this._getCached('otherPolysInsideOf')
  }

  /* Array of polys this segments is inside of, not including it's own. */
  get otherMultiPolysInsideOf () {
    return this._getCached('otherMultiPolysInsideOf')
  }

  /* Is this segment part of the final result? */
  get isInResult () {
    return this._getCached('isInResult')
  }

  /* The first segment previous segment chain that is in the result */
  get prevInResult () {
    let prev = this.prev
    while (prev && !prev.isInResult) prev = prev.prev
    return prev
  }

  _clearCache () {
    this._cache = {
      isInResult: null,
      sweepLineEntersRing: null,
      otherRingsInsideOf: null,
      otherPolysInsideOf: null,
      otherMultiPolysInsideOf: null
    }
  }

  _getCached (propName, calcMethod) {
    // if this._cache[something] isn't set, fill it with this._caclSomething()
    if (this._cache[propName] === null) {
      const calcMethod = this[`_${propName}`].bind(this)
      this._cache[propName] = calcMethod()
    }
    return this._cache[propName]
  }

  _sweepLineEntersRing () {
    if (!this.prev) return true
    if (this.prev.ringIn === this.ringIn) return false
    return !this.prev.otherRingsInsideOf.includes(this.ringIn)
  }

  _otherRingsInsideOf () {
    if (!this.prev) return []
    if (this.prev.ringIn === this.ringIn) return this.prev.otherRingsInsideOf

    const rings = this.prev.otherRingsInsideOf.filter(r => r !== this.ringIn)
    if (this.prev.sweepLineEntersRing) return [this.prev.ringIn, ...rings]
    else return rings.filter(r => r !== this.prev.ringIn)
  }

  _otherPolysInsideOf () {
    const polys = Array.from(new Set(this.otherRingsInsideOf.map(r => r.poly)))
    return polys.filter(
      p => p !== this.ringIn.poly && p.isInside(this.otherRingsInsideOf)
    )
  }

  _otherMultiPolysInsideOf () {
    return Array.from(new Set(this.otherPolysInsideOf.map(p => p.multipoly)))
  }

  _isInResult () {
    if (!this.isCoincident) {
      switch (operation.type) {
        case operation.types.INTERSECTION:
          return this.isInsideAllOthers

        case operation.types.UNION:
          return this.isOutsideAllOthers

        case operation.types.XOR:
          // all sides from both INTERSECTION and UNION
          return this.isInsideAllOthers || this.isOutsideAllOthers

        default:
          throw new Error(`Unrecognized operation type found ${operation.type}`)
      }
    }

    if (operation.type === operation.types.XOR) return false
    if (!this.isCoincidenceWinner) return false
    if (!this.coincidentsSweepLineEntersRingAllMatch) return false

    return true
  }
}

module.exports = Segment
