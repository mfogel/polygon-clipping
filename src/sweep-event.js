const { cosineOfAngle, sineOfAngle } = require('./point')

class SweepEvent {
  static compare (a, b) {
    if (a === b) return 0

    // favor event with a point that the sweep line hits first
    const pointCmp = SweepEvent.comparePoints(a.point, b.point)
    if (pointCmp !== 0) return pointCmp

    // favor right events over left
    if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1

    // favor events where the line segment is lower
    if (!a.segment.isPointColinear(b.otherSE.point)) {
      return !a.segment.isPointBelow(b.otherSE.point) ? 1 : -1
    }

    // as a tie-breaker, favor lower segment creation id
    const [aId, bId] = [a.segment.ringIn.id, b.segment.ringIn.id]
    if (aId !== bId) return aId < bId ? -1 : 1

    // NOTE:  We don't sort on segment length because that changes
    //        as segments are divided.

    throw new Error('SweepEvent comparison failed... identical but not?')
  }

  static comparePoints (a, b) {
    // favor lower X
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1

    // favor lower Y
    if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1

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
    this.linkedEvents.push(...other.linkedEvents)
    other.linkedEvents = this.linkedEvents
  }

  get availableLinkedEvents () {
    return this.linkedEvents.filter(
      evt => evt !== this && evt.segment.isInResult && !evt.segment.ringOut
    )
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

      if (asine >= 0 && bsine >= 0) {
        if (acosine === bcosine) return 0
        return acosine > bcosine ? -1 : 1
      }
      if (asine < 0 && bsine < 0) {
        if (acosine === bcosine) return 0
        return acosine < bcosine ? -1 : 1
      }
      return asine > bsine ? -1 : 1
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
