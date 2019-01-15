import { cmp, cmpPoints } from './flp'
import { cosineOfAngle, sineOfAngle } from './vector'

// Give sweep events unique ID's to get consistent sorting of
// segments and sweep events when all else is identical
let sweepEventId = 0

export default class SweepEvent {

  static compare (a, b) {

    // if the events are already linked, then we know the points are equal
    if (a.point !== b.point) {

      // favor event with a point that the sweep line hits first
      const cmpX = cmp(a.point.x, b.point.x)
      if (cmpX !== 0) return cmpX

      const cmpY = cmp(a.point.y, b.point.y)
      if (cmpY !== 0) return cmpY

      // Points are equal, so go ahead and link these events.
      a.link(b)
    }

    // favor right events over left
    if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1

    // are they identical?
    if (a === b) return 0

    // The calcuations of relative segment angle below can give different
    // results after segment splitting due to rounding errors.
    // To maintain sweep event queue ordering, we thus skip these calculations
    // if we already know the segements to be colinear (one of the requirements
    // of the 'consumedBy' relationship).
    let aConsumedBy = a
    let bConsumedBy = b
    while (aConsumedBy.consumedBy) aConsumedBy = aConsumedBy.consumedBy
    while (bConsumedBy.consumedBy) bConsumedBy = bConsumedBy.consumedBy
    if (aConsumedBy !== bConsumedBy) {

      // favor vertical segments for left events, and non-vertical for right
      // https://github.com/mfogel/polygon-clipping/issues/29
      const aVert = a.segment.isVertical()
      const bVert = b.segment.isVertical()
      if (aVert && ! bVert) return a.isLeft ? 1 : -1
      if (! aVert && bVert) return a.isLeft ? -1 : 1

      // Favor events where the line segment is lower.
      // Sometimes, because one segment is longer than the other,
      // one of these comparisons will return 0 and the other won't.
      const pointSegCmp = a.segment.compareVertically(b.otherSE.point)
      if (pointSegCmp === 1) return -1
      if (pointSegCmp === -1) return 1
      const otherPointSegCmp = b.segment.compareVertically(a.otherSE.point)
      if (otherPointSegCmp !== 0) return otherPointSegCmp

      // NOTE:  We don't sort on segment length because that changes
      //        as segments are divided.
    }

    // as a tie-breaker, favor lower creation id
    if (a.id < b.id) return -1
    if (a.id > b.id) return 1

    throw new Error(
      `SweepEvent comparison failed at [${a.point.x}, ${a.point.y}]`
    )
  }

  // Warning: 'point' input will be modified and re-used (for performance)
  constructor (point, isLeft) {
    if (point.events === undefined) point.events = [this]
    else point.events.push(this)
    this.point = point
    this.isLeft = isLeft
    this.id = ++sweepEventId
    // this.segment, this.otherSE set by factory
  }

  link (other) {
    if (other.point === this.point) {
      throw new Error(`Tried to link already linked events`)
    }
    const numOriginalEvents = this.point.events.length
    const otherEvents = other.point.events
    for (let i = 0, iMax = otherEvents.length; i < iMax; i++) {
      const evt = otherEvents[i]
      this.point.events.push(evt)
      evt.point = this.point
      for (let j = 0, jMax = numOriginalEvents; j < jMax; j++) {
        if (this.point.events[j].otherSE.point === evt.otherSE.point) {
          this.point.events[j].segment.consume(evt.segment)
        }
      }
    }
  }

  getAvailableLinkedEvents () {
    // point.events is always of length 2 or greater
    const events = []
    for (let i = 0, iMax = this.point.events.length; i < iMax; i++) {
      const evt = this.point.events[i]
      if (evt !== this && !evt.segment.ringOut && evt.segment.isInResult()) {
        events.push(evt)
      }
    }
    return events
  }

  /**
   * Returns a comparator function for sorting linked events that will
   * favor the event that will give us the smallest left-side angle.
   * All ring construction starts as low as possible heading to the right,
   * so by always turning left as sharp as possible we'll get polygons
   * without uncessary loops & holes.
   *
   * The comparator function has a compute cache such that it avoids
   * re-computing already-computed values.
   */
  getLeftmostComparator (baseEvent) {
    const cache = new Map()

    const fillCache = linkedEvent => {
      const nextEvent = linkedEvent.otherSE
      cache.set(linkedEvent, {
        sine: sineOfAngle(this.point, baseEvent.point, nextEvent.point),
        cosine: cosineOfAngle(this.point, baseEvent.point, nextEvent.point)
      })
    }

    return (a, b) => {
      if (!cache.has(a)) fillCache(a)
      if (!cache.has(b)) fillCache(b)

      const { sine: asine, cosine: acosine } = cache.get(a)
      const { sine: bsine, cosine: bcosine } = cache.get(b)

      const cmpZeroASine = cmp(asine, 0)
      const cmpZeroBSine = cmp(bsine, 0)

      if (cmpZeroASine >= 0 && cmpZeroBSine >= 0) return cmp(bcosine, acosine)
      if (cmpZeroASine < 0 && cmpZeroBSine < 0) return cmp(acosine, bcosine)
      return cmp(bsine, asine)
    }
  }
}
