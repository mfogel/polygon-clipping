const { flpCompare } = require('./flp')
const { cosineOfAngle, sineOfAngle } = require('./vector')

class SweepEvent {
  static compare (a, b) {
    if (a === b) return 0

    // favor event with a point that the sweep line hits first
    const pointCmp = SweepEvent.comparePoints(a.point, b.point)
    if (pointCmp !== 0) return pointCmp

    // favor right events over left
    if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1

    // favor events where the line segment is lower
    const pointSegCmp = a.segment.comparePoint(b.otherSE.point)
    if (pointSegCmp !== 0) return pointSegCmp < 0 ? 1 : -1

    // as a tie-breaker, favor lower segment creation id
    const aId = a.segment.ringIn.id
    const bId = b.segment.ringIn.id
    if (aId !== bId) return aId < bId ? -1 : 1

    // NOTE:  We don't sort on segment length because that changes
    //        as segments are divided.

    throw new Error(
      `SweepEvent comparison failed at [${a.point}]... equal but not identical?`
    )
  }

  static comparePoints (a, b) {
    // favor lower X
    const cmpX = flpCompare(a[0], b[0])
    if (cmpX !== 0) return cmpX

    // favor lower Y
    const cmpY = flpCompare(a[1], b[1])
    if (cmpY !== 0) return cmpY

    // else they're the same
    return 0
  }

  constructor (point, segment) {
    this.point = point
    this.segment = segment
    this.linkedEvents = [this]
  }

  link (other) {
    if (other.linkedEvents.length > 1) {
      throw new Error('Cannot link an already-linked event')
    }
    for (let i = 0; i < other.linkedEvents.length; i++) {
      this.linkedEvents.push(other.linkedEvents[i])
    }
    other.linkedEvents = this.linkedEvents
  }

  getAvailableLinkedEvents () {
    const events = []
    for (let i = 0; i < this.linkedEvents.length; i++) {
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

      const cmpZeroASine = flpCompare(asine, 0)
      const cmpZeroBSine = flpCompare(bsine, 0)

      if (cmpZeroASine >= 0 && cmpZeroBSine >= 0) {
        return flpCompare(bcosine, acosine)
      }
      if (cmpZeroASine < 0 && cmpZeroBSine < 0) {
        return flpCompare(acosine, bcosine)
      }
      return flpCompare(bsine, asine)
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

module.exports = SweepEvent
