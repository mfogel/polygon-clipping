import operation from './operation'
import SweepEvent from './sweep-event'
import { isInBbox, getBboxOverlap, getUniqueCorners } from './bbox'
import { cmp, cmpPoints } from './flp'
import { crossProduct, compareVectorAngles, intersection, perpendicular, verticalIntersection } from './vector'

export default class Segment {
  static compare (a, b) {

    const alx = a.leftSE.point.x
    const aly = a.leftSE.point.y
    const blx = b.leftSE.point.x
    const bly = b.leftSE.point.y
    const arx = a.rightSE.point.x
    const brx = b.rightSE.point.x

    // check if they're even in the same vertical plane
    if (cmp(brx, alx) < 0) return 1
    if (cmp(arx, blx) < 0) return -1

    // check for a consumption relationship. if present,
    // avoid the segment angle calculations (can yield
    // inconsistent results after splitting)
    let aConsumedBy = a
    let bConsumedBy = b
    while (aConsumedBy.consumedBy) aConsumedBy = aConsumedBy.consumedBy
    while (bConsumedBy.consumedBy) bConsumedBy = bConsumedBy.consumedBy

    // for segment angle comparisons
    let aCmpBLeft, aCmpBRight, bCmpALeft, bCmpARight

    if (aConsumedBy === bConsumedBy) {
      // are they identical?
      if (a === b) return 0

      // colinear segments with matching left-endpoints, fall back
      // on creation order of left sweep events as a tie-breaker
      const aId = a.leftSE.id
      const bId = b.leftSE.id
      if (aId < bId) return -1
      if (aId > bId) return 1

    } else if (
      // are a and b colinear?
      (aCmpBLeft = a.comparePoint(b.leftSE.point)) === 0 &&
      (aCmpBRight = a.comparePoint(b.rightSE.point)) === 0 &&
      (bCmpALeft = b.comparePoint(a.leftSE.point)) === 0 &&
      (bCmpARight = b.comparePoint(a.rightSE.point)) === 0
    ) {
      // they're colinear

      // colinear segments with non-matching left-endpoints, consider
      // the more-left endpoint to be earlier
      const cmpLX = cmp(alx, blx)
      if (cmpLX !== 0) return cmpLX

      // NOTE: we do not use segment length to break a tie here, because
      //       when segments are split their length changes

      // colinear segments with matching left-endpoints, fall back
      // on creation order of left sweep events as a tie-breaker
      const aId = a.leftSE.id
      const bId = b.leftSE.id
      if (aId < bId) return -1
      if (aId > bId) return 1

    } else {
      // not colinear

      // if the our left endpoints are not in the same vertical line,
      // consider a vertical line at the rightmore of the two left endpoints,
      // consider the segment that intersects lower with that line to be earlier
      const cmpLX = cmp(alx, blx)
      if (cmpLX < 0) {
        if (aCmpBLeft === 1) return -1
        if (aCmpBLeft === -1) return 1
      }
      if (cmpLX > 0) {
        if (bCmpALeft === undefined) bCmpALeft = b.comparePoint(a.leftSE.point)
        if (bCmpALeft !== 0) return bCmpALeft
      }

      // one or both of the left endpoints intersect with the other segment,
      // so consider the segment that angles more downward to be earlier
      const cmpLY = cmp(aly, bly)
      if (cmpLY === 0) {
        // special case verticals due to rounding errors
        // part of https://github.com/mfogel/polygon-clipping/issues/29
        const aVert = a.isVertical()
        if (aVert !== b.isVertical()) return aVert ? 1 : -1
        else {
          // sometimes, because one segment is longer than the other,
          // one of these comparisons will return 0 and the other won't
          if (aCmpBRight === undefined) aCmpBRight = a.comparePoint(b.rightSE.point)
          if (aCmpBRight > 0) return -1
          if (aCmpBRight < 0) return 1
          if (bCmpARight === undefined) bCmpARight = b.comparePoint(a.rightSE.point)
          if (bCmpARight > 0) return 1
          if (bCmpARight < 0) return -1
        }
      } else {
        // left endpoints are in the same vertical line but don't overlap exactly,
        // lower means ealier
        return cmpLY
      }
    }

    throw new Error(
      `Segment comparison of ` +
      `[${a.leftSE.point.x}, ${a.leftSE.point.y}] -> [${a.rightSE.point.x}, ${a.rightSE.point.y}] ` +
      `against ` +
      `[${b.leftSE.point.x}, ${b.leftSE.point.y}] -> [${b.rightSE.point.x}, ${b.rightSE.point.y}] ` +
      `failed. Please submit a bug report.`
    )
  }

  /* Warning: a reference to ringsIn input will be stored,
   *  and possibly will be later modified */
  constructor (leftSE, rightSE, ringsIn) {
    this.leftSE = leftSE
    leftSE.segment = this
    leftSE.otherSE = rightSE
    this.rightSE = rightSE
    rightSE.segment = this
    rightSE.otherSE = leftSE
    this.ringsIn = ringsIn
    this._cache = {}
    // left unset for performance, set later in algorithm
    // this.ringOut, this.consumedBy, this.prev
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
    return new Segment(leftSE, rightSE, [ring])
  }

  /* When a segment is split, the rightSE is replaced with a new sweep event */
  replaceRightSE (newRightSE) {
    this.rightSE = newRightSE
    this.rightSE.segment = this
    this.rightSE.otherSE = this.leftSE
    this.leftSE.otherSE = this.rightSE
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

  isAnEndpoint (point) {
    return (
      cmpPoints(point, this.leftSE.point) === 0 ||
      cmpPoints(point, this.rightSE.point) === 0
    )
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

    // Trying to be as exact as possible here, hence not using flp comparisons
    if (point.y < interPt.y) return -1
    if (point.y > interPt.y) return 1
    if (point.x > interPt.x) return -1
    if (point.x < interPt.x) return 1
    return 0
  }

  /* Does the given point fall on this segment? Greedy comparison */
  touches (point) {
    if (this.isAnEndpoint(point)) return true
    const v1 = this.vector()
    const v2 = perpendicular(v1)
    const interPt = intersection(this.leftSE.point, v1, point, v2)
    return cmpPoints(point, interPt) === 0
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
      const pt = bboxCorners[i]
      if (this.touches(pt) && other.touches(pt)) intersections.push(pt)
    }

    if (intersections.length === 0) {
      // general case of one intersection between non-overlapping segments
      const pt = intersection(this.leftSE.point, this.vector(), other.leftSE.point, other.vector())
      if (pt !== null && isInBbox(bboxOverlap, pt)) intersections.push(pt)
    }

    return intersections
  }

  /**
   * Split the given segment into multiple segments on the given points.
   *  * Each existing segment will retain its leftSE and a new rightSE will be
   *    generated for it.
   *  * A new segment will be generated which will adopt the original segment's
   *    rightSE, and a new leftSE will be generated for it.
   *  * If there are more than two points given to split on, new segments
   *    in the middle will be generated with new leftSE and rightSE's.
   *  * An array of the newly generated SweepEvents will be returned.
   *
   * Warning: input array of points is modified
   */
  split (points) {
    // sort the points in sweep line order
    points.sort(cmpPoints)

    let prevSeg = this
    let prevPoint = null

    const newEvents = []
    for (let i = 0, iMax = points.length; i < iMax; i++) {
      const point = points[i]
      // skip repeated points
      if (prevPoint && cmpPoints(prevPoint, point) === 0) continue

      const newLeftSE = new SweepEvent(point, true)
      const newRightSE = new SweepEvent(point, false)
      const oldRightSE = prevSeg.rightSE
      prevSeg.replaceRightSE(newRightSE)
      newEvents.push(newRightSE)
      newEvents.push(newLeftSE)

      prevSeg = new Segment(newLeftSE, oldRightSE, this.ringsIn.slice())
      prevPoint = point
    }

    return newEvents
  }

  /* Consume another segment. We take their ringsIn under our wing
   * and mark them as consumed. Use for perfectly overlapping segments */
  consume (other) {
    let consumer = this
    let consumee = other
    while (consumer.consumedBy) consumer = consumer.consumedBy
    while (consumee.consumedBy) consumee = consumee.consumedBy

    const cmp = Segment.compare(consumer, consumee)
    if (cmp === 0) return  // already consumed
    // the winner of the consumption is the earlier segment
    // according to sweep line ordering
    if (cmp  > 0) {
      const tmp = consumer
      consumer = consumee
      consumee = tmp
    }

    for (let i = 0, iMax = consumee.ringsIn.length; i < iMax; i++) {
      consumer.ringsIn.push(consumee.ringsIn[i])
    }
    consumee.ringsIn = null
    consumee.consumedBy = consumer

    // mark sweep events consumed as to maintain ordering in sweep event queue
    consumee.leftSE.consumedBy = consumer.leftSE
    consumee.rightSE.consumedBy = consumer.rightSE
  }

  /* The first segment previous segment chain that is in the result */
  prevInResult () {
    const key = 'prevInResult'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _prevInResult () {
    if (! this.prev) return null
    if (this.prev.isInResult()) return this.prev
    return this.prev.prevInResult()
  }

  ringsBefore () {
    const key = 'ringsBefore'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _ringsBefore () {
    if (! this.prev) return []
    return (this.prev.consumedBy || this.prev).ringsAfter()
  }

  ringsAfter () {
    const key = 'ringsAfter'
    if (this._cache[key] === undefined) this._cache[key] = this[`_${key}`]()
    return this._cache[key]
  }

  _ringsAfter () {
    const rings = this.ringsBefore().slice(0)
    for (let i = 0, iMax = this.ringsIn.length; i < iMax; i++) {
      const ring = this.ringsIn[i]
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
    if (! this.prev) return []
    return (this.prev.consumedBy || this.prev).multiPolysAfter()
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
    // if we've been consumed, we're not in the result
    if (this.consumedBy) return false

    const mpsBefore = this.multiPolysBefore()
    const mpsAfter = this.multiPolysAfter()

    switch (operation.type) {
      case 'union':
        // UNION - included iff:
        //  * On one side of us there is 0 poly interiors AND
        //  * On the other side there is 1 or more.
        const noBefores = mpsBefore.length === 0
        const noAfters = mpsAfter.length === 0
        return noBefores !== noAfters

      case 'intersection':
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

      case 'xor':
        // XOR - included iff:
        //  * the difference between the number of multipolys represented
        //    with poly interiors on our two sides is an odd number
        const diff = Math.abs(mpsBefore.length - mpsAfter.length)
        return diff % 2 === 1

      case 'difference':
        // DIFFERENCE included iff:
        //  * on exactly one side, we have just the subject
        const isJustSubject = mps => mps.length === 1 && mps[0].isSubject
        return isJustSubject(mpsBefore) !== isJustSubject(mpsAfter)

      default:
        throw new Error(`Unrecognized operation type found ${operation.type}`)
    }
  }

}
