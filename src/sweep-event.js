const edgeType = require('./edge-type')
const operationType = require('./operation-type')
const signedArea = require('./signed-area')

class SweepEvent {
  constructor (point, isLeft, otherEvent, isSubject) {
    this.point = point
    this.isLeft = isLeft
    this.otherEvent = otherEvent
    this.isSubject = isSubject

    // TODO: review these defaults... are some also set elsewhere?
    this.edgeType = edgeType.NORMAL
    this.sweepLineEnters = null
    this.isInsideOther = null
    this.isInResult = null
    this.isExteriorRing = true
  }

  isBelow (p) {
    return this.isLeft
      ? signedArea(this.point, this.otherEvent.point, p) > 0
      : signedArea(this.otherEvent.point, this.point, p) > 0
  }

  isAbove (p) {
    return !this.isBelow(p)
  }

  isVertical () {
    return this.point[0] === this.otherEvent.point[0]
  }

  setEdgeTypeForCoincidesWith (otherEvent) {
    otherEvent.edgeType = edgeType.NON_CONTRIBUTING
    this.edgeType =
      otherEvent.sweepLineEnters === this.sweepLineEnters
        ? edgeType.SAME_TRANSITION
        : edgeType.DIFFERENT_TRANSITION
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

  refreshIsInsideOther (prevEvent, operation) {
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

  refreshIsInResult (prevEvent, operation) {
    if (this.isInsideOther === null) {
      this.refreshIsInsideOther(prevEvent, operation)
    }

    const calcIsInResultForNormalEdge = operation => {
      switch (operation) {
        case operationType.INTERSECTION:
          return this.isInsideOther
        case operationType.UNION:
          return !this.isInsideOther
        case operationType.XOR:
          // TODO: is this right?
          return true
        case operationType.DIFFERENCE:
          return (
            (this.isSubject && !this.isInsideOther) ||
            (!this.isSubject && this.isInsideOther)
          )
        default:
          throw new Error(`Unrecognized operationType, '${operation}'`)
      }
    }

    const calcIsInResult = operation => {
      switch (this.edgeType) {
        case edgeType.NORMAL:
          return calcIsInResultForNormalEdge(operation)
        case edgeType.SAME_TRANSITION:
          return (
            operation === operationType.INTERSECTION ||
            operation === operationType.UNION
          )
        case edgeType.DIFFERENT_TRANSITION:
          return operation === operationType.DIFFERENCE
        case edgeType.NON_CONTRIBUTING:
          return false
        default:
          throw new Error(`Unrecognized edgeType, '${edgeType}'`)
      }
    }

    this.isInResult = calcIsInResult(operation)
  }
}

module.exports = SweepEvent
