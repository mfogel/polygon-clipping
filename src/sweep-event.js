import { cmp } from './flp'
import { cosineOfAngle, sineOfAngle } from './vector'

export default class SweepEvent {
  static compareBefore (a, b) {
    // favor event with a point that the sweep line hits first
    const cmpX = cmp(a.point.x, b.point.x)
    if (cmpX !== 0) return cmpX < 0

    const cmpY = cmp(a.point.y, b.point.y)
    if (cmpY !== 0) return cmpY < 0

    // favor right events over left
    if (a.isLeft !== b.isLeft) return !a.isLeft

    // favor events where the line segment is lower
    const pointSegCmp = a.segment.comparePoint(b.otherSE.point)
    if (pointSegCmp !== 0) return pointSegCmp > 0

    // as a tie-breaker, favor lower segment creation id
    const aId = a.segment.ringIn.id
    const bId = b.segment.ringIn.id
    if (aId !== bId) return aId < bId

    // NOTE:  We don't sort on segment length because that changes
    //        as segments are divided.

    // they appear to be the same point... are they?
    if (a === b) return false

    throw new Error(
      `SweepEvent comparison failed at [${a.point.x}, ${a.point.y}]... ` +
        `equal but not identical?`
    )
  }

  constructor (point, segment) {
    this.point = point
    this.segment = segment
    this.linkedEvents = [this]
  }

  link (other) {
    const otherLE = other.linkedEvents
    for (let i = 0, iMax = otherLE.length; i < iMax; i++) {
      const evt = otherLE[i]
      this.linkedEvents.push(evt)
      evt.linkedEvents = this.linkedEvents
    }
  }

  getAvailableLinkedEvents () {
    const events = []
    for (let i = 0, iMax = this.linkedEvents.length; i < iMax; i++) {
      const evt = this.linkedEvents[i]
      if (evt !== this && !evt.segment.ringOut && evt.segment.isInResult) {
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

  get isLeft () {
    return this === this.segment.leftSE
  }

  get isRight () {
    return this === this.segment.rightSE
  }

  get otherSE () {
    return this.segment.getOtherSE(this)
  }
}
