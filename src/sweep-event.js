const operationTypes = require('./operation-types')
const { arePointsColinear, crossProduct } = require('./point')

const edgeTypes = {
  NORMAL: 0,
  NON_CONTRIBUTING: 1,
  SAME_TRANSITION: 2,
  DIFFERENT_TRANSITION: 3
}

class SweepEvent {
  static compare (a, b) {
    // favor event with a point that the sweep line hits first
    const pointCmp = SweepEvent.comparePoints(a.point, b.point)
    if (pointCmp !== 0) return pointCmp

    // favor right events over left
    if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1

    // favor events where the line segment is lower
    if (!arePointsColinear(a.point, a.otherEvent.point, b.otherEvent.point)) {
      return !a.isBelow(b.otherEvent.point) ? 1 : -1
    }

    // TODO: favor shorter line segment?

    // favor events from subject over clipping
    if (a.isSubject !== b.isSubject) return a.isSubject ? -1 : 1

    // else they're totally equal
    return 0
  }

  static comparePoints (a, b) {
    // favor lower X
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1

    // favor lower Y
    if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1

    // else they're the same
    return 0
  }

  constructor (point, isSubject, segment) {
    this.point = point
    this.isSubject = isSubject
    this.segment = segment

    // TODO: I am skeptical about these.
    this.isExteriorRing = true
    this.ringId = null

    this.otherEvent = null
    this.prevEvent = null
    this.coincidentEvent = null

    // cache of dynamically computed properies
    this._clearCache()
  }

  isBelow (point) {
    return this.compareWithPoint(point) > 0
  }

  isColinear (point) {
    return this.compareWithPoint(point) === 0
  }

  isAbove (point) {
    return this.compareWithPoint(point) < 0
  }

  compareWithPoint (point) {
    const [p0, p1, p2] = [this.point, this.otherEvent.point, point]
    const p20 = [p0[0] - p2[0], p0[1] - p2[1]]
    const p21 = [p1[0] - p2[0], p1[1] - p2[1]]
    const kross = crossProduct(p20, p21)
    if (kross === 0) return 0
    if (this.isLeft) return kross > 0 ? 1 : -1
    else return kross < 0 ? 1 : -1
  }

  isVertical () {
    return this.point[0] === this.otherEvent.point[0]
  }

  get isLeft () {
    return this === this.segment.leftSE
  }

  get isRight () {
    return this === this.segment.rightSE
  }

  isCoincidenceWinner () {
    // first event is declared winner, second looser
    return this.coincidentEvent && this.coincidentEvent !== this.prevEvent
  }

  registerCoincidentEvent (event, isWinner) {
    this.coincidentEvent = event
    if (!isWinner) this.prevEvent = event
    this._clearCache()
  }

  registerPrevEvent (event) {
    this.prevEvent = event
    this._clearCache()
  }

  get edgeType () {
    return this._getCached('edgeType', this._calcEdgeType)
  }

  get sweepLineEnters () {
    return this._getCached('sweepLineEnters', this._calcSweepLineEnters)
  }

  get isInsideOther () {
    return this._getCached('isInsideOther', this._calcIsInsideOther)
  }

  get isInResult () {
    return this._getCached('isInResult', this._calcIsInResult)
  }

  _clearCache () {
    this._cache = {
      edgeType: null,
      sweepLineEnters: null,
      isInsideOther: null,
      isInResult: null
    }
  }

  _getCached (propName, calcMethod) {
    // if this._cache[something] isn't set, fill it with this._caclSomething()
    if (this._cache[propName] === null) {
      this._cache[propName] = calcMethod.bind(this)()
    }
    return this._cache[propName]
  }

  _calcEdgeType () {
    if (this.coincidentEvent) {
      if (this.isCoincidenceWinner()) {
        return this.coincidentEvent.sweepLineEnters === this.sweepLineEnters
          ? edgeTypes.SAME_TRANSITION
          : edgeTypes.DIFFERENT_TRANSITION
      } else return edgeTypes.NON_CONTRIBUTING
    } else return edgeTypes.NORMAL
  }

  _calcSweepLineEnters () {
    if (!this.prevEvent) return true
    else {
      return this.isSubject === this.prevEvent.isSubject
        ? !this.prevEvent.sweepLineEnters
        : !this.prevEvent.isInsideOther
    }
  }

  _calcIsInsideOther () {
    if (!this.prevEvent) return false
    else {
      if (this.isSubject === this.prevEvent.isSubject) {
        return this.prevEvent.isInsideOther
      } else {
        return this.prevEvent.isVertical()
          ? !this.prevEvent.sweepLineEnters
          : this.prevEvent.sweepLineEnters
      }
    }
  }

  _calcIsInResult () {
    switch (this.edgeType) {
      case edgeTypes.NORMAL:
        if (operationTypes.isActive(operationTypes.INTERSECTION)) {
          return this.isInsideOther
        } else if (operationTypes.isActive(operationTypes.UNION)) {
          return !this.isInsideOther
        } else if (operationTypes.isActive(operationTypes.XOR)) {
          // TODO: is this right?
          return true
        } else if (operationTypes.isActive(operationTypes.DIFFERENCE)) {
          return (
            (this.isSubject && !this.isInsideOther) ||
            (!this.isSubject && this.isInsideOther)
          )
        } else {
          throw new Error('No active operationType found')
        }
      case edgeTypes.SAME_TRANSITION:
        return (
          operationTypes.isActive(operationTypes.INTERSECTION) ||
          operationTypes.isActive(operationTypes.UNION)
        )
      case edgeTypes.DIFFERENT_TRANSITION:
        return operationTypes.isActive(operationTypes.DIFFERENCE)
      case edgeTypes.NON_CONTRIBUTING:
        return false
      default:
        throw new Error(`Unrecognized edgeType, '${this.edgeType}'`)
    }
  }
}

module.exports = SweepEvent
