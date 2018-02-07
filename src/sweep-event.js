const compareEvents = require('./compare-events')
const operationTypes = require('./operation-types')
const { crossProduct } = require('./point')

const edgeTypes = {
  NORMAL: 0,
  NON_CONTRIBUTING: 1,
  SAME_TRANSITION: 2,
  DIFFERENT_TRANSITION: 3
}

class SweepEvent {
  static buildPair (p1, p2, isSubject) {
    const e1 = new SweepEvent(p1, isSubject)
    const e2 = new SweepEvent(p2, isSubject)
    e1.otherEvent = e2
    e2.otherEvent = e1

    // TODO: should this be using a 'comparePoints' and setting isLeft
    // directly in the constructor? (yes)
    //
    // TODO: order [left, right] of returned points... should it matter?
    if (compareEvents(e1, e2) > 0) {
      e1.isLeft = false
      e2.isLeft = true
      return [e2, e1]
    } else {
      e1.isLeft = true
      e2.isLeft = false
      return [e1, e2]
    }
  }

  constructor (point, isSubject) {
    this.point = point
    this.isSubject = isSubject

    // TODO: I am skeptical about these.
    this.isExteriorRing = true
    this.contourId = null

    // TODO: review these defaults... are some also set elsewhere?
    this.edgeType = edgeTypes.NORMAL
    this.otherEvent = null
    this.isLeft = null
    this.sweepLineEnters = null
    this.isInsideOther = null
    this.isInResult = null
  }

  isBelow (point) {
    const [p0, p1, p2] = [this.point, this.otherEvent.point, point]
    const p20 = [p0[0] - p2[0], p0[1] - p2[1]]
    const p21 = [p1[0] - p2[0], p1[1] - p2[1]]
    const kross = crossProduct(p20, p21)
    return this.isLeft ? kross > 0 : kross < 0
  }

  isAbove (point) {
    // TODO: this isn't correct for a point that's colinear with the segment
    return !this.isBelow(point)
  }

  isVertical () {
    return this.point[0] === this.otherEvent.point[0]
  }

  setEdgeTypeForCoincidesWith (otherEvent) {
    otherEvent.edgeType = edgeTypes.NON_CONTRIBUTING
    this.edgeType =
      otherEvent.sweepLineEnters === this.sweepLineEnters
        ? edgeTypes.SAME_TRANSITION
        : edgeTypes.DIFFERENT_TRANSITION
  }

  refreshSweepLineEnters (prevEvent) {
    if (!prevEvent) this.sweepLineEnters = true
    else {
      if (this.isSubject === prevEvent.isSubject) {
        this.sweepLineEnters = !prevEvent.sweepLineEnters
      } else {
        this.sweepLineEnters = !prevEvent.isInsideOther
      }
    }
  }

  refreshIsInsideOther (prevEvent) {
    this.refreshSweepLineEnters(prevEvent)

    if (!prevEvent) this.isInsideOther = false
    else {
      if (this.isSubject === prevEvent.isSubject) {
        this.isInsideOther = prevEvent.isInsideOther
      } else {
        this.isInsideOther = prevEvent.isVertical()
          ? !prevEvent.sweepLineEnters
          : prevEvent.sweepLineEnters
      }
    }
  }

  refreshIsInResult (prevEvent) {
    if (this.isInsideOther === null) {
      this.refreshIsInsideOther(prevEvent)
    }

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
