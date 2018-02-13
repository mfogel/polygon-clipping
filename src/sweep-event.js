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

    // favor events from subject over clipping
    if (a.isSubject !== b.isSubject) return a.isSubject ? -1 : 1

    // as a tie-breaker, favor lower segment creation id
    const [aId, bId] = [a.segment.creationId, b.segment.creationId]
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
    this._linkedEvents = null
  }

  link (other) {
    if (other._linkedEvents) {
      throw new Error('Cannot link an already-linked event')
    }
    if (!this._linkedEvents) this._linkedEvents = [this]
    this._linkedEvents.push(other)
    other._linkedEvents = this._linkedEvents
  }

  get availableLinkedEvents () {
    if (!this._linkedEvents) return []
    return this._linkedEvents.filter(
      evt => evt !== this && evt.segment.isInResult && !evt.segment.isProcessed
    )
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

  get isSubject () {
    return this.segment.isSubject
  }
}

module.exports = SweepEvent
