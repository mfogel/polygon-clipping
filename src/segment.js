import operation from './operation'
import SweepEvent from './sweep-event'
import { isInBbox, getBboxOverlap, getUniqueCorners } from './bbox'
import { cmp, cmpPoints } from './flp'
import { crossProduct, compareVectorAngles, intersection, perpendicular } from './vector'

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

      // overlapping segments from the same ring
      // https://github.com/mfogel/polygon-clipping/issues/48
      const aTie = a.tiebreaker()
      const bTie = b.tiebreaker()
      if (aTie < bTie) return -1
      if (aTie > bTie) return 1

    } else {
      // not colinear

      // if the our left endpoints are not in the same vertical line,
      // consider a vertical line at the rightmore of the two left endpoints,
      // consider the segment that intersects lower with that line to be earlier
      if (cmpLX < 0) return cmpLeft === 1 ? -1 : 1
      if (cmpLX > 0) return b.comparePoint(a.leftSE.point) === 1 ? 1 : -1

      // if our left endpoints match, consider the segment
      // that angles more downward to be earlier
      const cmpLY = cmp(aly, bly)
      if (cmpLY === 0) {
        // special case verticals due to rounding errors
        // part of https://github.com/mfogel/polygon-clipping/issues/29
        const aVert = a.isVertical()
        if (aVert !== b.isVertical()) return aVert ? 1 : -1
        else return a.comparePoint(b.rightSE.point) > 0 ? -1 : 1
      }

      // left endpoints are in the same vertical line but don't overlap exactly,
      // lower means ealier
      return cmpLY
    }

    throw new Error(
      `Segment comparison from [${a.leftSE.point.x}, ${a.leftSE.point.y}]` +
      ` to [${a.rightSE.point.x}, ${a.rightSE.point.y}] failed`
    )
  }

  constructor (leftSE, rightSE, ringIn) {
    this.leftSE = leftSE
    if (leftSE !== null) {
      leftSE.segment = this
      leftSE.otherSE = rightSE
    }
    this.rightSE = rightSE
    if (rightSE !== null) {
      rightSE.segment = this
      rightSE.otherSE = leftSE
    }
    this.ringIn = ringIn
    this.ringOut = null
    this.prev = null
    this.coincidents = [this]
    this._cache = {}
  }

  static fromRing(point1, point2, ring) {
    let leftSE, rightSE
    const ptCmp = cmpPoints(point1, point2)
    if (ptCmp < 0) {
      leftSE = new SweepEvent(point1, true)
      rightSE = new SweepEvent(point2, false)
    } else if (ptCmp > 0) {
      leftSE = new SweepEvent(point2, true)
      rightSE = new SweepEvent(point1, false)
    } else {
      throw new Error(
        `Tried to create degenerate segment at [${point1.x}, ${point2.y}]`
      )
    }
    return new Segment(leftSE, rightSE, ring)
  }

  // used for sorting equal sweep events, segments consistently
  tiebreaker () {
    if (this._tiebreaker === undefined) this._tiebreaker = Math.random()
    return this._tiebreaker
  }

  bbox () {
    const y1 = this.leftSE.point.y
    const y2 = this.rightSE.point.y
    return {
      ll: { x: this.leftSE.point.x, y: y1 < y2 ? y1 : y2 },
      ur: { x: this.rightSE.point.x, y: y1 > y2 ? y1 : y2 }
    }
  }

  /* A vector from the left point to the right */
  vector () {
    return {
      x: this.rightSE.point.x - this.leftSE.point.x,
      y: this.rightSE.point.y - this.leftSE.point.y
    }
  }

  isVertical () {
    return cmp(this.leftSE.point.x, this.rightSE.point.x) === 0
  }

  swapEvents () {
    const tmp = this.leftSE
    this.leftSE = this.rightSE
    this.leftSE.isLeft = true
    this.rightSE = tmp
    this.rightSE.isLeft = false
  }

  isAnEndpoint (point) {
    return (
      cmpPoints(point, this.leftSE.point) === 0 ||
      cmpPoints(point, this.rightSE.point) === 0
    )
  }

  isPointOn (point) {
    return isInBbox(this.bbox(), point) && this.comparePoint(point) === 0
  }

  /* Compare this segment with a point. Return value indicates
   *    1: point is below segment
   *    0: point is colinear to segment
   *   -1: point is above segment */
  comparePoint (point) {
    if (this.isAnEndpoint(point)) return 0
    const v1 = this.vector()
    const v2 = perpendicular(v1)
    const interPt = intersection(this.leftSE.point, v1, point, v2)

    const cmpY = cmp(point.y, interPt.y)
    if (cmpY !== 0) return cmpY
    return cmp(interPt.x, point.x)
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
    const bboxOverlap = getBboxOverlap(this.bbox(), other.bbox())
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

    // general case of one intersection between non-overlapping segments
    const pt = intersection(this.leftSE.point, this.vector(), other.leftSE.point, other.vector())
    if (pt !== null && isInBbox(bboxOverlap, pt)) return [pt]
    return []
  }

  /**
   * Split the given segment and all of its coincidents into multiple segments
   * on the given points.
   *  * Each existing segment will retain its leftSE and a new rightSE will be
   *    generated for it.
   *  * A new segment will be generated which will adopt the original segment's
   *    rightSE, and a new leftSE will be generated for it.
   *  * New segments will be marked coincident as needed.
   *  * If there are more than two points given to split on, new segments
   *    in the middle will be generated with new leftSE and rightSE's.
   *  * An array of the newly generated SweepEvents will be returned.
   */
  split (points) {
    // sort them and unique-ify them
    points.sort(cmpPoints)
    const newPts = []
    for (var i = 0; i < points.length; i++) {
      if (i === 0 || cmpPoints(points[i - 1], points[i]) !== 0) newPts.push(points[i])
    }
    points = newPts

    for (let i = 0, iMax = points.length; i < iMax; i++) {
      const pt = points[i]
      if (this.isAnEndpoint(pt)) {
        throw new Error(
          `Cannot split segment upon endpoint at [${pt.x}, ${pt.y}]`
        )
      }
    }

    const point = points.shift()
    const newSegments = []
    const newEvents = []
    for (let i = 0, iMax = this.coincidents.length; i < iMax; i++) {
      const thisSeg = this.coincidents[i]
      const newLeftSE = new SweepEvent(point, true)
      const newRightSE = new SweepEvent(point, false)
      newSegments.push(new Segment(newLeftSE, thisSeg.rightSE, thisSeg.ringIn))
      thisSeg.rightSE = newRightSE
      thisSeg.rightSE.segment = thisSeg
      thisSeg.rightSE.otherSE = thisSeg.leftSE
      thisSeg.leftSE.otherSE = thisSeg.rightSE
      newEvents.push(newRightSE)
      newEvents.push(newLeftSE)
    }

    for (let i = 1, iMax = newSegments.length; i < iMax; i++) {
      newSegments[i].registerCoincident(newSegments[i-1])
    }

    if (points.length > 0) {
      const moreNewEvents = newSegments[0].split(points)
      for (let i = 0, iMax = moreNewEvents.length; i < iMax; i++) {
        newEvents.push(moreNewEvents[i])
      }
    }
    return newEvents
  }

  registerPrev (other) {
    this.prev = other
  }

  registerRingOut (ring) {
    this.ringOut = ring
  }

  registerCoincident (other) {
    if (this.coincidents == other.coincidents) return // already coincident
    const otherCoincidents = other.coincidents
    for (let i = 0, iMax = otherCoincidents.length; i < iMax; i++) {
      const seg = otherCoincidents[i]
      this.coincidents.push(seg)
      seg.coincidents = this.coincidents
    }
    // put the 'winner' at the front. arbitrary: winner has lowest ringId
    this.coincidents.sort((a, b) => a.ringIn.id - b.ringIn.id)
  }

  /* The first segment previous segment chain that is in the result */
  prevInResult () {
    const key = 'prevInResult'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _prevInResult () {
    if (this.prev === null) return null
    if (this.prev.isInResult()) return this.prev
    return this.prev.prevInResult()
  }

  ringsBefore () {
    const key = 'ringsBefore'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _ringsBefore () {
    if (!this.prev) return []
    if (this.coincidents === this.prev.coincidents) return this.prev.ringsBefore()
    return this.prev.ringsAfter()
  }

  ringsAfter () {
    const key = 'ringsAfter'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _ringsAfter () {
    const rings = this.ringsBefore().slice(0)
    for (let i = 0, iMax = this.coincidents.length; i < iMax; i++) {
      const ring = this.coincidents[i].ringIn
      const index = rings.indexOf(ring)
      if (index === -1) rings.push(ring)
      else rings.splice(index, 1)
    }
    return rings
  }

  multiPolysBefore () {
    const key = 'multiPolysBefore'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _multiPolysBefore () {
    if (!this.prev) return []
    if (this.coincidents === this.prev.coincidents) {
      return this.prev.multiPolysBefore()
    }
    return this.prev.multiPolysAfter()
  }

  multiPolysAfter () {
    const key = 'multiPolysAfter'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _multiPolysAfter () {
    // first calcualte our polysAfter
    const polysAfter = []
    const polysExclude = []
    const ringsAfter = this.ringsAfter()
    for (let i = 0, iMax = ringsAfter.length; i < iMax; i++) {
      const ring = ringsAfter[i]
      const poly = ring.poly
      if (polysExclude.includes(poly)) continue
      if (ring.isExterior) polysAfter.push(poly)
      else {
        if (! polysExclude.includes(poly)) polysExclude.push(poly)
        const index = polysAfter.indexOf(ring.poly)
        if (index !== -1) polysAfter.splice(index, 1)
      }
    }
    // now calculate our multiPolysAfter
    const mps = []
    for (let i = 0, iMax = polysAfter.length; i < iMax; i++) {
      const mp = polysAfter[i].multiPoly
      if (!mps.includes(mp)) mps.push(mp)
    }
    return mps
  }

  /* Is this segment part of the final result? */
  isInResult () {
    const key = 'isInResult'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _isInResult () {
    // if it's not the coincidence winner, it's not in the resul
    if (this !== this.coincidents[0]) return false

    const mpsBefore = this.multiPolysBefore()
    const mpsAfter = this.multiPolysAfter()

    switch (operation.type) {
      case operation.types.UNION:
        // UNION - included iff:
        //  * On one side of us there is 0 poly interiors AND
        //  * On the other side there is 1 or more.
        const noBefores = mpsBefore.length === 0
        const noAfters = mpsAfter.length === 0
        return noBefores !== noAfters

      case operation.types.INTERSECTION:
        // INTERSECTION - included iff:
        //  * on one side of us all multipolys are rep. with poly interiors AND
        //  * on the other side of us, not all multipolys are repsented
        //    with poly interiors
        let least
        let most
        if (mpsBefore.length < mpsAfter.length) {
          least = mpsBefore.length
          most = mpsAfter.length
        } else {
          least = mpsAfter.length
          most = mpsBefore.length
        }
        return most === operation.numMultiPolys && least < most

      case operation.types.XOR:
        // XOR - included iff:
        //  * the difference between the number of multipolys represented
        //    with poly interiors on our two sides is an odd number
        const diff = Math.abs(mpsBefore.length - mpsAfter.length)
        return diff % 2 === 1

      case operation.types.DIFFERENCE:
        // DIFFERENCE included iff:
        //  * on exactly one side, we have just the subject
        const isJustSubject = mps => mps.length === 1 && mps[0].isSubject
        return isJustSubject(mpsBefore) !== isJustSubject(mpsAfter)

      default:
        throw new Error(`Unrecognized operation type found ${operation.type}`)
    }
  }

}
