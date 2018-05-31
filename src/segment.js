import operation from './operation'
import SweepEvent from './sweep-event'
import { isInBbox, getBboxOverlap, getUniqueCorners } from './bbox'
import { cmp, cmpPoints } from './flp'
import { crossProduct, compareVectorAngles } from './vector'

export default class Segment {
  static compare (a, b) {
    if (a === b) return 0

    const alx = a.leftSE.point.x
    const aly = a.leftSE.point.y
    const blx = b.leftSE.point.x
    const bly = b.leftSE.point.y
    const arx = a.rightSE.point.x
    const brx = b.rightSE.point.x

    // check if they're even in the same vertical plane
    if (cmp(brx, alx) < 0) return 1
    if (cmp(arx, blx) < 0) return -1

    const cmpLeft = a.comparePoint(b.leftSE.point)
    const cmpLX = cmp(alx, blx)

    // are a and b colinear?
    if (
      cmpLeft === 0 &&
      a.comparePoint(b.rightSE.point) === 0 &&
      b.comparePoint(a.leftSE.point) === 0 &&
      b.comparePoint(a.rightSE.point) === 0
    ) {
      // colinear segments with non-matching left-endpoints, consider
      // the more-left endpoint to be earlier
      if (cmpLX !== 0) return cmpLX

      // colinear segments with matching left-endpoints, fall back
      // on creation order of segments as a tie-breaker
      // NOTE: we do not use segment length to break a tie here, because
      //       when segments are split their length changes
      if (a.ringIn.id !== b.ringIn.id) {
        return a.ringIn.id < b.ringIn.id ? -1 : 1
      }
    } else {
      // not colinear

      // if the our left endpoints are not in the same vertical line,
      // consider a vertical line at the rightmore of the two left endpoints,
      // consider the segment that intersects lower with that line to be earlier
      if (cmpLX < 0) return cmpLeft === 1 ? -1 : 1
      if (cmpLX > 0) return b.comparePoint(a.leftSE.point) === 1 ? 1 : -1

      // if our left endpoints match, consider the segment
      // that angles more downward to be earlier
      if (cmpLX === 0 && cmp(a.leftSE.point.y, b.leftSE.point.y) === 0) {
        return a.comparePoint(b.rightSE.point) > 0 ? -1 : 1
      }

      // left endpoints are in the same vertical line but don't overlap exactly,
      // lower means ealier
      return cmp(aly, bly)
    }

    throw new Error(
      `Segment comparison (from [${a.leftSE.point.x}, ${a.leftSR.point.y}])` +
        ` -> to [${a.rightSE.point.x}, ${a.rightSE.point.y}]) failed... ` +
        ` segments equal but not identical?`
    )
  }

  constructor (point1, point2, ring) {
    this.ringIn = ring
    this.ringOut = null

    const ptCmp = cmpPoints(point1, point2)
    let lp
    let rp
    if (ptCmp < 0) {
      lp = point1
      rp = point2
      this.flowL2R = true
    } else if (ptCmp > 0) {
      lp = point2
      rp = point1
      this.flowL2R = false
    } else {
      throw new Error(
        `Tried to create degenerate segment at [${point1.x}, ${point1.y}]`
      )
    }

    this.leftSE = new SweepEvent(lp, this)
    this.rightSE = new SweepEvent(rp, this)

    // cache of dynamically computed properies
    this._clearCache()
  }

  clone () {
    const seg = new Segment(this.leftSE.point, this.rightSE.point, this.ringIn)
    seg.flowL2R = this.flowL2R
    return seg
  }

  get bbox () {
    const y1 = this.leftSE.point.y
    const y2 = this.rightSE.point.y
    return {
      ll: { x: this.leftSE.point.x, y: y1 < y2 ? y1 : y2 },
      ur: { x: this.rightSE.point.x, y: y1 > y2 ? y1 : y2 }
    }
  }

  /* A vector from the left point to the right */
  get vector () {
    return {
      x: this.rightSE.point.x - this.leftSE.point.x,
      y: this.rightSE.point.y - this.leftSE.point.y
    }
  }

  get isVertical () {
    return cmp(this.leftSE.point.x, this.rightSE.point.x) === 0
  }

  /* In the original ringIn, which event came second */
  get flowIntoSE () {
    return this.flowL2R ? this.rightSE : this.leftSE
  }

  getOtherSE (se) {
    if (se === this.leftSE) return this.rightSE
    if (se === this.rightSE) return this.leftSE
    throw new Error('may only be called by own sweep events')
  }

  isAnEndpoint (point) {
    return (
      cmpPoints(point, this.leftSE.point) === 0 ||
      cmpPoints(point, this.rightSE.point) === 0
    )
  }

  isPointOn (point) {
    return isInBbox(this.bbox, point) && this.comparePoint(point) === 0
  }

  /* Compare this segment with a point. Return value indicates
   *    1: point is below segment
   *    0: point is colinear to segment
   *   -1: point is above segment */
  comparePoint (point) {
    if (this.isAnEndpoint(point)) return 0
    return compareVectorAngles(point, this.leftSE.point, this.rightSE.point)
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
    const intersections = []
    const bboxCorners = getUniqueCorners(bboxOverlap)
    for (let i = 0, iMax = bboxCorners.length; i < iMax; i++) {
      const point = bboxCorners[i]
      // test if this point is an intersection
      if (
        (this.isAnEndpoint(point) && other.isPointOn(point)) ||
        (other.isAnEndpoint(point) && this.isPointOn(point))
      ) {
        intersections.push(point)
      }
    }
    if (intersections.length > 0) return intersections

    // General case for non-overlapping segments.
    // This algorithm is based on Schneider and Eberly.
    // http://www.cimec.org.ar/~ncalvo/Schneider_Eberly.pdf - pg 244
    const al = this.leftSE.point
    const bl = other.leftSE.point
    const va = this.vector
    const vb = other.vector
    const ve = { x: bl.x - al.x, y: bl.y - al.y }
    const kross = crossProduct(va, vb)

    // not on line segment a
    const s = crossProduct(ve, vb) / kross
    if (cmp(s, 0) < 0 || cmp(1, s) < 0) return []

    const t = crossProduct(ve, va) / kross
    if (cmp(t, 0) < 0 || cmp(1, t) < 0) return []

    // intersection is in a midpoint of both lines, let's average them and
    // bound the result by org bbox (otherwise leftSE and rightSE could swap)
    let x = (al.x + s * va.x + bl.x + t * vb.x) / 2
    let y = (al.y + s * va.y + bl.y + t * vb.y) / 2
    if (x < bboxOverlap.ll.x) x = bboxOverlap.ll.x
    if (x > bboxOverlap.ur.x) x = bboxOverlap.ur.x
    if (y < bboxOverlap.ll.y) y = bboxOverlap.ll.y
    if (y > bboxOverlap.ur.y) y = bboxOverlap.ur.y
    return [{ x: x, y: y }]
  }

  /**
   * Split the given segment into multiple segments on the given points.
   *  * The existing segment will retain it's leftSE and a new rightSE will be
   *    generated for it.
   *  * A new segment will be generated which will adopt the original segment's
   *    rightSE, and a new leftSE will be generated for it.
   *  * If there are more than two points given to split on, new segments
   *    in the middle will be generated with new leftSE and rightSE's.
   *  * An array of the newly generated SweepEvents will be returned.
   */
  split (points) {
    // sort them and unique-ify them
    points.sort(cmpPoints)
    points = points.filter(
      (pt, i, pts) => i === 0 || cmpPoints(pts[i - 1], pt) !== 0
    )

    for (let i = 0, iMax = points.length; i < iMax; i++) {
      const pt = points[i]
      if (this.isAnEndpoint(pt)) {
        throw new Error(
          `Cannot split segment upon endpoint at [${pt.x}, ${pt.y}]`
        )
      }
    }

    const point = points.shift()
    const newSeg = this.clone()
    newSeg.leftSE = new SweepEvent(point, newSeg)
    newSeg.rightSE = this.rightSE
    this.rightSE.segment = newSeg
    this.rightSE = new SweepEvent(point, this)
    const newEvents = [this.rightSE, newSeg.leftSE]

    if (points.length > 0) {
      const moreNewEvents = newSeg.split(points)
      for (let i = 0, iMax = moreNewEvents.length; i < iMax; i++) {
        newEvents.push(moreNewEvents[i])
      }
    }
    return newEvents
  }

  registerPrev (other) {
    this.prev = other
    this._clearCache()
  }

  registerRingOut (ring) {
    this.ringOut = ring
  }

  /* The first segment previous segment chain that is in the result */
  get prevInResult () {
    const key = 'prevInResult'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _prevInResult () {
    let prev = this.prev
    while (prev && !prev.isInResult) prev = prev.prev
    return prev
  }

  /* The segments, including ourselves, for which we overlap perfectly */
  get coincidents () {
    const key = 'coincidents'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _coincidents () {
    // a coincident will have both left and right sweepEvents linked with us
    const coincidents = []
    const leftLinkedEvents = this.leftSE.linkedEvents
    const rightLinkedEvents = this.rightSE.linkedEvents
    for (let i = 0, iMax = leftLinkedEvents.length; i < iMax; i++) {
      const leftSE = leftLinkedEvents[i]
      if (!leftSE.isLeft) continue
      if (leftSE.segment.rightSE.linkedEvents !== rightLinkedEvents) continue
      coincidents.push(leftSE.segment)
    }

    if (coincidents.length > 0) {
      // put the 'winner' at the front
      // arbitary - winner is the one with lowest ringId
      coincidents.sort((a, b) => a.ringIn.id - b.ringIn.id)

      // set this in all our coincident's caches so they don't have to calc it
      for (let i = 0, iMax = coincidents.length; i < iMax; i++) {
        coincidents[i]._cache['coincidents'] = coincidents
      }
    }
    return coincidents
  }

  get prevNotCoincident () {
    const key = 'prevNotCoincident'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _prevNotCoincident () {
    // iterating backwards from next to prev
    let next = this
    let prev = this.prev
    while (prev && next.coincidents === prev.coincidents) {
      next = prev
      prev = prev.prev
    }
    return prev
  }

  /* Does the sweep line, when it intersects this segment, enter the ring? */
  get sweepLineEntersRing () {
    const key = 'sweepLineEntersRing'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _sweepLineEntersRing () {
    // opposite of previous segment on the same ring
    let prev = this.prevNotCoincident
    while (prev) {
      for (let i = 0, iMax = prev.coincidents.length; i < iMax; i++) {
        const seg = prev.coincidents[i]
        if (seg.ringIn === this.ringIn) return !seg.sweepLineEntersRing
      }
      prev = prev.prevNotCoincident
    }
    return true
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
    const key = 'ringsInsideOf'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _ringsInsideOf () {
    if (!this.prev) return []

    // coincidents always share the same rings. Return same array to save mem
    if (this.coincidents === this.prev.coincidents) {
      return this.prev.ringsInsideOf
    }

    let rings = []
    let prevRingsInsideOf = this.prev.ringsInsideOf
    let prevRingsEntering = this.prev.getRingsEntering()
    let ringsExiting = this.getRingsExiting()

    // rings our prev was inside of all count, except those we're exiting
    for (let i = 0, iMax = prevRingsInsideOf.length; i < iMax; i++) {
      const ring = prevRingsInsideOf[i]
      if (!ringsExiting.includes(ring)) rings.push(ring)
    }

    // rings our prev was entering of all count, except those we're exiting
    for (let i = 0, iMax = prevRingsEntering.length; i < iMax; i++) {
      const ring = prevRingsEntering[i]
      if (!ringsExiting.includes(ring)) rings.push(ring)
    }

    return rings
  }

  /* Array of input rings this segment is on boundary of */
  getRingsOnEdgeOf () {
    const rings = []
    for (let i = 0, iMax = this.coincidents.length; i < iMax; i++) {
      rings.push(this.coincidents[i].ringIn)
    }
    return rings
  }

  /* Array of input rings this segment is on boundary of,
   * and for which the sweep line enters when intersecting there */
  getRingsEntering () {
    const rings = []
    for (let i = 0, iMax = this.coincidents.length; i < iMax; i++) {
      const segment = this.coincidents[i]
      if (!segment.sweepLineEntersRing) continue
      rings.push(segment.ringIn)
    }
    return rings
  }

  /* Array of input rings this segment is on boundary of,
   * and for which the sweep line exits when intersecting there */
  getRingsExiting () {
    const rings = []
    for (let i = 0, iMax = this.coincidents.length; i < iMax; i++) {
      const segment = this.coincidents[i]
      if (segment.sweepLineEntersRing) continue
      rings.push(segment.ringIn)
    }
    return rings
  }

  /* Is this segment valid on our own polygon? (ie not outside exterior ring) */
  get isValidEdgeForPoly () {
    const key = 'isValidEdgeForPoly'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _isValidEdgeForPoly () {
    // SLER: sweep line entering orientation
    let sameSLER
    let diffSLER
    if (this.sweepLineEntersRing) {
      sameSLER = this.getRingsEntering()
      diffSLER = this.getRingsExiting()
    } else {
      diffSLER = this.getRingsEntering()
      sameSLER = this.getRingsExiting()
    }
    return this.ringIn.isValid(sameSLER, diffSLER, this.ringsInsideOf)
  }

  /* Array of multipolys this segment is inside of */
  getMultiPolysInsideOf () {
    const mps = []
    for (let i = 0, iMax = this.ringsInsideOf.length; i < iMax; i++) {
      const poly = this.ringsInsideOf[i].poly
      if (mps.includes(poly.multiPoly)) continue
      if (!poly.isInside(this.getRingsOnEdgeOf(), this.ringsInsideOf)) continue
      mps.push(poly.multiPoly)
    }
    return mps
  }

  /* The multipolys on one side of us */
  getMultiPolysSLPEnters (multiPolysInsideOf) {
    // start with the multipolys we're fully inside
    const mps = multiPolysInsideOf.slice()
    // add the multipolys we have the sweep line entering
    for (let i = 0, iMax = this.coincidents.length; i < iMax; i++) {
      const seg = this.coincidents[i]
      if (!seg.sweepLineEntersPoly) continue
      const mp = seg.ringIn.poly.multiPoly
      if (!mps.includes(mp)) mps.push(mp)
    }
    return mps
  }

  /* The multipolys on the other side of us */
  getMultiPolysSLPExits (multiPolysInsideOf) {
    // start with the multipolys we're fully inside
    const mps = multiPolysInsideOf.slice()
    // add the multipolys we have the sweep line entering
    for (let i = 0, iMax = this.coincidents.length; i < iMax; i++) {
      const seg = this.coincidents[i]
      if (!seg.sweepLineExitsPoly) continue
      const mp = seg.ringIn.poly.multiPoly
      if (!mps.includes(mp)) mps.push(mp)
    }
    return mps
  }

  /* Is this segment part of the final result? */
  get isInResult () {
    const key = 'isInResult'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _isInResult () {
    // if it's not the coincidence winner, it's not in the resul
    if (this !== this.coincidents[0]) return false

    const multiPolysInsideOf = this.getMultiPolysInsideOf()
    const multiPolysSLPEnters = this.getMultiPolysSLPEnters(multiPolysInsideOf)
    const multiPolysSLPExits = this.getMultiPolysSLPExits(multiPolysInsideOf)

    switch (operation.type) {
      case operation.types.UNION:
        // UNION - included iff:
        //  * On one side of us there is 0 poly interiors AND
        //  * On the other side there is 1 or more.
        const noEnters = multiPolysSLPEnters.length === 0
        const noExits = multiPolysSLPExits.length === 0
        return noEnters !== noExits

      case operation.types.INTERSECTION:
        // INTERSECTION - included iff:
        //  * on one side of us all multipolys are rep. with poly interiors AND
        //  * on the other side of us, not all multipolys are repsented
        //    with poly interiors
        let least
        let most
        if (multiPolysSLPEnters.length < multiPolysSLPExits.length) {
          least = multiPolysSLPEnters.length
          most = multiPolysSLPExits.length
        } else {
          least = multiPolysSLPExits.length
          most = multiPolysSLPEnters.length
        }
        return most === operation.numMultiPolys && least < most

      case operation.types.XOR:
        // XOR - included iff:
        //  * the difference between the number of multipolys represented
        //    with poly interiors on our two sides is an odd number
        const diff = Math.abs(
          multiPolysSLPEnters.length - multiPolysSLPExits.length
        )
        return diff % 2 === 1

      case operation.types.DIFFERENCE:
        // DIFFERENCE included iff:
        //  * on exactly one side, we have just the subject
        const isJustSubject = mps => mps.length === 1 && mps[0].isSubject
        return (
          isJustSubject(multiPolysSLPEnters) !==
          isJustSubject(multiPolysSLPExits)
        )

      default:
        throw new Error(`Unrecognized operation type found ${operation.type}`)
    }
  }

  _clearCache () {
    this._cache = {}
  }
}
