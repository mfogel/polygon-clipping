import operation from './operation'
import SweepEvent from './sweep-event'
import { isInBbox, touchesBbox, getBboxOverlap } from './bbox'
import { touchPoints } from './flp'
import { closestPoint, intersection } from './vector'
import rounder from './rounder'

// Give segments unique ID's to get consistent sorting of
// segments and sweep events when all else is identical
let segmentId = 0

export default class Segment {

  /* This compare() function is for ordering segments in the sweep
   * line tree, and does so according to the following criteria:
   *
   * Consider the vertical line that lies an infinestimal step to the
   * right of the right-more of the two left endpoints of the input
   * segments. Imagine slowly moving a point up from negative infinity
   * in the increasing y direction. Which of the two segments will that
   * point intersect first? That segment comes 'before' the other one.
   *
   * If neither segment would be intersected by such a line, (if one
   * or more of the segments are vertical) then the line to be considered
   * is directly on the right-more of the two left inputs.
   */
  static compare (a, b) {

    const alx = a.leftSE.point.x
    const blx = b.leftSE.point.x
    const arx = a.rightSE.point.x
    const brx = b.rightSE.point.x

    // check if they're even in the same vertical plane
    if (brx < alx) return 1
    if (arx < blx) return -1

    const aly = a.leftSE.point.y
    const bly = b.leftSE.point.y
    const ary = a.rightSE.point.y
    const bry = b.rightSE.point.y

    // is left endpoint of segment B the right-more?
    if (alx < blx) {
      // are the two segments in the same horizontal plane?
      if (bly < aly && bly < ary) return 1
      if (bly > aly && bly > ary) return -1

      // is the B left endpoint colinear to segment A?
      const aCmpBLeft = a.comparePoint(b.leftSE.point)
      if (aCmpBLeft < 0) return 1
      if (aCmpBLeft > 0) return -1

      // is the A right endpoint colinear to segment B ?
      const bCmpARight = b.comparePoint(a.rightSE.point)
      if (bCmpARight !== 0) return bCmpARight

      // colinear segments, consider the one with left-more
      // left endpoint to be first (arbitrary?)
      return -1
    }

    // is left endpoint of segment A the right-more?
    if (alx > blx) {
      if (aly < bly && aly < bry) return -1
      if (aly > bly && aly > bry) return 1

      // is the A left endpoint colinear to segment B?
      const bCmpALeft = b.comparePoint(a.leftSE.point)
      if (bCmpALeft !== 0) return bCmpALeft

      // is the B right endpoint colinear to segment A?
      const aCmpBRight = a.comparePoint(b.rightSE.point)
      if (aCmpBRight < 0) return 1
      if (aCmpBRight > 0) return -1

      // colinear segments, consider the one with left-more
      // left endpoint to be first (arbitrary?)
      return 1
    }

    // if we get here, the two left endpoints are in the same
    // vertical plane, ie alx === blx

    // consider the lower left-endpoint to come first
    if (aly < bly) return -1
    if (aly > bly) return 1

    // left endpoints are identical
    // check for colinearity by using the left-more right endpoint

    // is the A right endpoint more left-more?
    if (arx < brx) {
      const bCmpARight = b.comparePoint(a.rightSE.point)
      if (bCmpARight !== 0) return bCmpARight

      // colinear segments with matching left endpoints,
      // consider the one with more left-more right endpoint to be first
      return -1
    }

    // is the B right endpoint more left-more?
    if (arx > brx) {
      const aCmpBRight = a.comparePoint(b.rightSE.point)
      if (aCmpBRight < 0) return 1
      if (aCmpBRight > 0) return -1

      // colinear segments with matching left endpoints,
      // consider the one with more left-more right endpoint to be first
      return 1
    }

    // if we get here, two two right endpoints are in the same
    // vertical plane, ie arx === brx

    // consider the lower right-endpoint to come first
    if (ary < bry) return -1
    if (ary > bry) return 1

    // right endpoints identical as well, so the segments are idential
    // fall back on creation order as consistent tie-breaker
    if (a.id < b.id) return -1
    if (a.id > b.id) return 1

    // identical segment, ie a === b
    return 0
  }

  /* Warning: a reference to ringsIn input will be stored,
   *  and possibly will be later modified */
  constructor (leftSE, rightSE, ringsIn) {
    this.id = ++segmentId
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

  static fromRing(pt1, pt2, ring) {
    let leftPt, rightPt

    // ordering the two points according to sweep line ordering
    const cmpPts = SweepEvent.comparePoints(pt1, pt2)
    if (cmpPts < 0) {
      leftPt = pt1
      rightPt = pt2
    }
    else if (cmpPts > 0) {
      leftPt = pt2
      rightPt = pt1
    }
    else throw new Error(
      `Tried to create degenerate segment at [${pt1.x}, ${pt1.y}]`
    )

    const leftSE = new SweepEvent(leftPt, true)
    const rightSE = new SweepEvent(rightPt, false)
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

  isAnEndpoint (pt) {
    return (
      (pt.x === this.leftSE.point.x && pt.y === this.leftSE.point.y) ||
      (pt.x === this.rightSE.point.x && pt.y === this.rightSE.point.y)
    )
  }

  /* Compare this segment with a point. Return value indicates:
   *     1: point lies above or to the left of segment
   *     0: point is colinear to segment
   *    -1: point is below or to the right of segment */
  comparePoint (point) {
    if (this.isAnEndpoint(point)) return 0
    const interPt = closestPoint(this.leftSE.point, this.rightSE.point, point)

    if (point.y < interPt.y) return -1
    if (point.y > interPt.y) return 1

    // depending on if our segment angles up or down,
    // the x coord comparison means oppposite things
    if (point.x < interPt.x) {
      if (this.leftSE.point.y < this.rightSE.point.y) return 1
      if (this.leftSE.point.y > this.rightSE.point.y) return -1
    }
    if (point.x > interPt.x) {
      if (this.leftSE.point.y < this.rightSE.point.y) return -1
      if (this.leftSE.point.y > this.rightSE.point.y) return 1
    }

    // on the line
    return 0
  }

  /* Does the point in question touch the given segment?
   * Greedy - essentially a 2 * Number.EPSILON comparison.
   * If it's not possible to add an independent point between the
   * point and the segment, we say the point 'touches' the segment. */
  touches (point) {
    if (!touchesBbox(this.bbox(), point)) return false
    // if the points have been linked already, performance boost use that
    if (point === this.leftSE.point || point === this.rightSE.point) return true
    // avoid doing vector math on tiny vectors
    if (touchPoints(this.leftSE.point, point)) return true
    if (touchPoints(this.rightSE.point, point)) return true
    const cPt1 = closestPoint(this.leftSE.point, this.rightSE.point, point)
    const avgPt1 = { x: (cPt1.x + point.x) / 2, y: (cPt1.y + point.y) / 2 }
    return touchPoints(avgPt1, cPt1) || touchPoints(avgPt1, point)
  }

  /**
   * Given another segment, returns the first non-trivial intersection
   * between the two segments (in terms of sweep line ordering), if it exists.
   *
   * A 'non-trivial' intersection is one that will cause one or both of the
   * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
   *
   *   * endpoint of segA with endpoint of segB --> trivial
   *   * endpoint of segA with point along segB --> non-trivial
   *   * endpoint of segB with point along segA --> non-trivial
   *   * point along segA with point along segB --> non-trivial
   *
   * If no non-trivial intersection exists, return null
   * Else, return null.
   */
  getIntersection (other) {
    // If bboxes don't overlap, there can't be any intersections
    const bboxOverlap = getBboxOverlap(this.bbox(), other.bbox())
    if (bboxOverlap === null) return null

    // We first check to see if the endpoints can be considered intersections.
    // This will 'snap' intersections to endpoints if possible, and will
    // handle cases of colinearity.

    // does each endpoint touch the other segment?
    const touchesOtherLSE = this.touches(other.leftSE.point)
    const touchesThisLSE = other.touches(this.leftSE.point)
    const touchesOtherRSE = this.touches(other.rightSE.point)
    const touchesThisRSE = other.touches(this.rightSE.point)

    // do left endpoints match?
    if (touchesThisLSE && touchesOtherLSE) {
      // these two cases are for colinear segments with matching left
      // endpoints, and one segment being longer than the other
      if (touchesThisRSE && !touchesOtherRSE) return this.rightSE.point
      if (!touchesThisRSE && touchesOtherRSE) return other.rightSE.point
      // either the two segments match exactly (two trival intersections)
      // or just on their left endpoint (one trivial intersection
      return null
    }

    // does this left endpoint matches (other doesn't)
    if (touchesThisLSE) {
      // check for segments that just intersect on opposing endpoints
      if (touchesOtherRSE && touchPoints(this.leftSE.point, other.rightSE.point)) return null
      // t-intersection on left endpoint
      return this.leftSE.point
    }

    // does other left endpoint matches (this doesn't)
    if (touchesOtherLSE) {
      // check for segments that just intersect on opposing endpoints
      if (touchesThisRSE && touchPoints(this.rightSE.point, other.leftSE.point)) return null
      // t-intersection on left endpoint
      return other.leftSE.point
    }

    // trivial intersection on right endpoints
    if (touchesThisRSE && touchesOtherRSE) return null

    // t-intersections on just one right endpoint
    if (touchesThisRSE) return this.rightSE.point
    if (touchesOtherRSE) return other.rightSE.point

    // None of our endpoints intersect. Look for a general intersection between
    // infinite lines laid over the segments
    const pt = intersection(this.leftSE.point, this.vector(), other.leftSE.point, other.vector())

    // are the segments parrallel? Note that if they were colinear with overlap,
    // they would have an endpoint intersection and that case was already handled above
    if (pt === null) return null

    // is the intersection found between the lines not on the segments?
    if (!isInBbox(bboxOverlap, pt)) return null

    // round the the computed point if needed
    return rounder.round(pt.x, pt.y)
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
  split (point) {
    const newEvents = []
    const alreadyLinked = point.events !== undefined

    const newLeftSE = new SweepEvent(point, true)
    const newRightSE = new SweepEvent(point, false)
    const oldRightSE = this.rightSE
    this.replaceRightSE(newRightSE)
    newEvents.push(newRightSE)
    newEvents.push(newLeftSE)
    new Segment(newLeftSE, oldRightSE, this.ringsIn.slice())

    // in the point we just used to create new sweep events with was already
    // linked to other events, we need to check if either of the affected
    // segments should be consumed
    if (alreadyLinked) {
      newLeftSE.checkForConsuming()
      newRightSE.checkForConsuming()
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

    // make sure a segment doesn't consume it's prev
    if (consumer.prev === consumee) {
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
      if (polysExclude.indexOf(poly) !== -1) continue
      if (ring.isExterior) polysAfter.push(poly)
      else {
        if (polysExclude.indexOf(poly) === -1) polysExclude.push(poly)
        const index = polysAfter.indexOf(ring.poly)
        if (index !== -1) polysAfter.splice(index, 1)
      }
    }
    // now calculate our multiPolysAfter
    const mps = []
    for (let i = 0, iMax = polysAfter.length; i < iMax; i++) {
      const mp = polysAfter[i].multiPoly
      if (mps.indexOf(mp) === -1) mps.push(mp)
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
      case 'union': {
        // UNION - included iff:
        //  * On one side of us there is 0 poly interiors AND
        //  * On the other side there is 1 or more.
        const noBefores = mpsBefore.length === 0
        const noAfters = mpsAfter.length === 0
        return noBefores !== noAfters
      }

      case 'intersection': {
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
      }

      case 'xor': {
        // XOR - included iff:
        //  * the difference between the number of multipolys represented
        //    with poly interiors on our two sides is an odd number
        const diff = Math.abs(mpsBefore.length - mpsAfter.length)
        return diff % 2 === 1
      }

      case 'difference': {
        // DIFFERENCE included iff:
        //  * on exactly one side, we have just the subject
        const isJustSubject = mps => mps.length === 1 && mps[0].isSubject
        return isJustSubject(mpsBefore) !== isJustSubject(mpsAfter)
      }

      default:
        throw new Error(`Unrecognized operation type found ${operation.type}`)
    }
  }

}
