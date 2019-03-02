import Segment from './segment'
import { cosineOfAngle, sineOfAngle } from './vector'

export default class SweepEvent {

  // for ordering sweep events in the sweep event queue
  static compare (a, b) {

    // favor event with a point that the sweep line hits first
    const ptCmp = SweepEvent.comparePoints(a.point, b.point)
    if (ptCmp !== 0) return ptCmp

    // the points are the same, so link them if needed
    if (a.point !== b.point) a.link(b)

    // favor right events over left
    if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1

    // we have two matching left or right endpoints
    // ordering of this case is the same as for their segments
    return Segment.compare(a.segment, b.segment)
  }

  // for ordering points in sweep line order
  static comparePoints (aPt, bPt) {
    if (aPt.x < bPt.x) return -1
    if (aPt.x > bPt.x) return 1

    if (aPt.y < bPt.y) return -1
    if (aPt.y > bPt.y) return 1

    return 0
  }

  // Warning: 'point' input will be modified and re-used (for performance)
  constructor (point, isLeft) {
    if (point.events === undefined) point.events = [this]
    else point.events.push(this)
    this.point = point
    this.isLeft = isLeft
    // this.segment, this.otherSE set by factory
  }

  link (other) {
    if (other.point === this.point) {
      throw new Error('Tried to link already linked events')
    }
    const otherEvents = other.point.events
    for (let i = 0, iMax = otherEvents.length; i < iMax; i++) {
      const evt = otherEvents[i]
      this.point.events.push(evt)
      evt.point = this.point
    }
    this.checkForConsuming()
  }

  /* Do a pass over our linked events and check to see if any pair
   * of segments match, and should be consumed. */
  checkForConsuming () {
    // FIXME: The loops in this method run O(n^2) => no good.
    //        Maintain little ordered sweep event trees?
    //        Can we maintaining an ordering that avoids the need
    //        for the re-sorting with getLeftmostComparator in geom-out?

    // Compare each pair of events to see if other events also match
    const numEvents = this.point.events.length
    for (let i = 0; i < numEvents; i++) {
      const evt1 = this.point.events[i]
      if (evt1.segment.consumedBy !== undefined) continue
      for (let j = i + 1; j < numEvents; j++) {
        const evt2 = this.point.events[j]
        if (evt2.consumedBy !== undefined) continue
        if (evt1.otherSE.point.events !== evt2.otherSE.point.events) continue
        evt1.segment.consume(evt2.segment)
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

      // both on or above x-axis
      if (asine >= 0 && bsine >= 0) {
        if (acosine < bcosine) return 1
        if (acosine > bcosine) return -1
        return 0
      }

      // both below x-axis
      if (asine < 0 && bsine < 0) {
        if (acosine < bcosine) return -1
        if (acosine > bcosine) return 1
        return 0
      }

      // one above x-axis, one below
      if (bsine < asine) return -1
      if (bsine > asine) return 1
      return 0
    }
  }
}
