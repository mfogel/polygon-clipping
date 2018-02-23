const operation = require('./operation')
const SweepEvent = require('./sweep-event')
const { isInBbox, getBboxOverlap, getUniqueCorners } = require('./bbox')
const { arePointsEqual, crossProduct, compareVectorAngles } = require('./point')

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
      if (a.ringIn.id !== b.ringIn.id) {
        return a.ringIn.id < b.ringIn.id ? -1 : 1
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

  constructor (point1, point2, ring) {
    if (arePointsEqual(point1, point2)) {
      throw new Error('Unable to build segment for identical points')
    }

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
    return new Segment(this.leftSE.point, this.rightSE.point, this.ringIn)
  }

  get bbox () {
    const ys = this.points.map(p => p[1])
    return [
      [this.points[0][0], Math.min(...ys)],
      [this.points[1][0], Math.max(...ys)]
    ]
  }

  /* A vector from the left point to the right */
  get vector () {
    return [
      this.rightSE.point[0] - this.leftSE.point[0],
      this.rightSE.point[1] - this.leftSE.point[1]
    ]
  }

  get isVertical () {
    return this.points[0][0] === this.points[1][0]
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
    return compareVectorAngles(point, this.points[0], this.points[1]) > 0
  }

  isPointColinear (point) {
    return compareVectorAngles(point, this.points[0], this.points[1]) === 0
  }

  isPointAbove (point) {
    return compareVectorAngles(point, this.points[0], this.points[1]) < 0
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
    this._clearCache()
  }

  registerRingOut (ring) {
    this.ringOut = ring
  }

  get isCoincidenceWinner () {
    // arbitary - winner is the one with lowest ringId
    const ringIds = this.coincidents.map(seg => seg.ringIn.id)
    return this.ringIn.id === Math.min(...ringIds)
  }

  /* Does the sweep line, when it intersects this segment, enter the ring? */
  get sweepLineEntersRing () {
    return this._getCached('sweepLineEntersRing')
  }

  /* Does the sweep line, when it intersects this segment, enter the polygon? */
  get sweepLineEntersPoly () {
    if (!this.isValidEdgeForPoly) return false
    return this.ringIn.isExterior === this.sweepLineEntersRing
  }

  /* Does the sweep line, when it intersects this segment, exit the polygon? */
  get sweepLineExitsPoly () {
    if (!this.isValidEdgeForPoly) return false
    return this.ringIn.isExterior !== this.sweepLineEntersRing
  }

  /* Array of input rings this segment is inside of (not on boundary) */
  get ringsInsideOf () {
    return this._getCached('ringsInsideOf')
  }

  /* Array of input rings this segment is on boundary of */
  get ringsOnEdgeOf () {
    return this._getCached('ringsOnEdgeOf')
  }

  /* Array of input rings this segment is on boundary of,
   * and for which the sweep line enters when intersecting there */
  get ringsEntering () {
    return this._getCached('ringsEntering')
  }

  /* Array of input rings this segment is on boundary of,
   * and for which the sweep line exits when intersecting there */
  get ringsExiting () {
    return this._getCached('ringsExiting')
  }

  /* Is this segment valid on our own polygon? (ie not outside exterior ring) */
  get isValidEdgeForPoly () {
    return this._getCached('isValidEdgeForPoly')
  }

  /* Array of polys this segment is inside of */
  get polysInsideOf () {
    const polys = Array.from(new Set(this.ringsInsideOf.map(r => r.poly)))
    return polys.filter(p => p.isInside(this.ringsOnEdgeOf, this.ringsInsideOf))
  }

  /* Array of multipolys this segment is inside of */
  get multiPolysInsideOf () {
    return Array.from(new Set(this.polysInsideOf.map(p => p.multipoly)))
  }

  /* Is this segment part of the final result? */
  get isInResult () {
    return this._getCached('isInResult')
  }

  /* The first segment previous segment chain that is in the result */
  get prevInResult () {
    return this._getCached('prevInResult')
  }

  get multiPolysSLPEnters () {
    const SLPEnters = this.coincidents.filter(c => c.sweepLineEntersPoly)
    return Array.from(new Set(SLPEnters.map(c => c.ringIn.poly.multipoly)))
  }

  get multiPolysSLPExits () {
    const SLPExits = this.coincidents.filter(c => c.sweepLineExitsPoly)
    return Array.from(new Set(SLPExits.map(c => c.ringIn.poly.multipoly)))
  }

  _clearCache () {
    this._cache = {}
  }

  _getCached (propName, calcMethod) {
    // if this._cache[something] isn't set, fill it with this._something()
    if (this._cache[propName] === undefined) {
      this._cache[propName] = this[`_${propName}`].bind(this)()
    }
    return this._cache[propName]
  }

  _prevInResult () {
    let prev = this.prev
    while (prev && !prev.isInResult) prev = prev.prev
    return prev
  }

  _sweepLineEntersRing () {
    // opposite of previous segment on the same ring
    let prev = this.prev
    while (prev && prev.ringIn !== this.ringIn) prev = prev.prev
    return !prev || !prev.sweepLineEntersRing
  }

  _ringsInsideOf () {
    // start with prev set of rings inside of, if any
    let rings = this.prev ? [...this.prev.ringsInsideOf] : []

    // coincidents always share the same
    if (this.coincidents.filter(c => c === this.prev).length > 0) return rings

    // remove any we exited, add any we entered
    if (this.prev) {
      rings = rings.filter(r => !this.prev.ringsExiting.includes(r))
      rings.push(...this.prev.ringsEntering)
    }

    // remove any that we're actually on the boundary of
    // (necessary for vertical segments)
    return rings.filter(r => !this.ringsOnEdgeOf.includes(r))
  }

  _ringsOnEdgeOf () {
    return this.coincidents.map(seg => seg.ringIn)
  }

  _ringsEntering () {
    return this.coincidents
      .filter(seg => seg.sweepLineEntersRing)
      .map(seg => seg.ringIn)
  }

  _ringsExiting () {
    return this.coincidents
      .filter(seg => !seg.sweepLineEntersRing)
      .map(seg => seg.ringIn)
  }

  _isValidEdgeForPoly () {
    const args = [this.ringsEntering, this.ringsExiting]
    if (!this.sweepLineEntersRing) args.reverse()
    return this.ringIn.isValid(...args, this.ringsInsideOf)
  }

  _isInResult () {
    if (!this.isCoincidenceWinner) return false

    switch (operation.type) {
      case operation.types.UNION:
        // UNION:
        //  * We are not within any polys
        //  * we have 0 coincidents on exactly one side - either one
        if (this.multiPolysInsideOf.length > 0) return false
        const noEnters = this.multiPolysSLPEnters.length === 0
        const noExits = this.multiPolysSLPExits.length === 0
        return noEnters !== noExits

      case operation.types.INTERSECTION:
        // INTERSECTION:
        // For all input geoms, there is at least one poly ST either:
        //  * we are inside it
        //  * we bound it
        const numGeoms =
          this.multiPolysInsideOf.length +
          Math.max(
            this.multiPolysSLPEnters.length,
            this.multiPolysSLPExits.length
          )
        return numGeoms === operation.numberOfGeoms

      case operation.types.XOR:
        // XOR:
        // For an odd number of geoms, there is at least one poly ST either:
        //  * we are inside it
        //  * we have a matching sweep line orientation with it
        const numGeomsEnters =
          this.multiPolysInsideOf.length + this.multiPolysSLPEnters.length

        const numGeomsExits =
          this.multiPolysInsideOf.length + this.multiPolysSLPExits.length

        return numGeomsEnters % 2 === 1 || numGeomsExits % 2 === 1

      default:
        throw new Error(`Unrecognized operation type found ${operation.type}`)
    }
  }
}

module.exports = Segment
