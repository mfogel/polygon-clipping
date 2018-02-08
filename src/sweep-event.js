const operationTypes = require('./operation-types')
const { comparePoints, crossProduct } = require('./point')

const edgeTypes = {
  NORMAL: 0,
  NON_CONTRIBUTING: 1,
  SAME_TRANSITION: 2,
  DIFFERENT_TRANSITION: 3
}

class SweepEvent {
  static buildPair (p1, p2, isSubject) {
    const comparePts = comparePoints(p1, p2)
    if (comparePts === 0) {
      throw new Error('Unable to build events for collapsed segment')
    }

    const e1 = new SweepEvent(p1, isSubject, comparePts < 0)
    const e2 = new SweepEvent(p2, isSubject, comparePts > 0)
    e1.otherEvent = e2
    e2.otherEvent = e1

    // TODO: order [left, right] of returned points... should it matter?
    return comparePts ? [e1, e2] : [e2, e1]
  }

  constructor (point, isSubject, isLeft) {
    this.point = point
    this.isSubject = isSubject
    this.isLeft = isLeft

    // TODO: I am skeptical about these.
    this.isExteriorRing = true
    this.ringId = null

    // TODO: review these defaults... are some also set elsewhere?
    this.edgeType = edgeTypes.NORMAL

    this.otherEvent = null
    this.prevEvent = null
    this.coincidentEvent = null
    this.sweepLineEnters = null
    this.isInsideOther = null
    this.isInResult = null
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

  isCoincidenceWinner () {
    // first event is declared winner, second looser
    return this.coincidentEvent && this.coincidentEvent !== this.prevEvent
  }

  registerCoincidentEvent (event, isWinner) {
    this.coincidentEvent = event
    if (!isWinner) this.registerPrevEvent(event)
    this.refreshEdgeType()
    this.refreshIsInResult()
  }

  registerPrevEvent (event) {
    this.prevEvent = event
    this.refreshSweepLineEnters()
    this.refreshIsInsideOther()
    this.refreshIsInResult()
  }

  refreshEdgeType () {
    if (this.isCoincidenceWinner()) {
      this.edgeType =
        this.coincidentEvent.sweepLineEnters === this.sweepLineEnters
          ? edgeTypes.SAME_TRANSITION
          : edgeTypes.DIFFERENT_TRANSITION
    } else this.edgeType = edgeTypes.NON_CONTRIBUTING
  }

  refreshSweepLineEnters () {
    if (!this.prevEvent) this.sweepLineEnters = true
    else {
      if (this.isSubject === this.prevEvent.isSubject) {
        this.sweepLineEnters = !this.prevEvent.sweepLineEnters
      } else {
        this.sweepLineEnters = !this.prevEvent.isInsideOther
      }
    }
  }

  refreshIsInsideOther () {
    if (!this.prevEvent) this.isInsideOther = false
    else {
      if (this.isSubject === this.prevEvent.isSubject) {
        this.isInsideOther = this.prevEvent.isInsideOther
      } else {
        this.isInsideOther = this.prevEvent.isVertical()
          ? !this.prevEvent.sweepLineEnters
          : this.prevEvent.sweepLineEnters
      }
    }
  }

  refreshIsInResult () {
    const calcIsInResultForNormalEdge = () => {
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
    }

    const calcIsInResult = () => {
      switch (this.edgeType) {
        case edgeTypes.NORMAL:
          return calcIsInResultForNormalEdge()
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

    this.isInResult = calcIsInResult()
  }
}

module.exports = SweepEvent
