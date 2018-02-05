const edgeType = require('./edge-type')
const operationType = require('./operation')

const computeFields = (event, prev, operation) => {
  // compute sweepLineEnters and isInsideOther fields
  if (prev === null) {
    event.sweepLineEnters = true
    event.isInsideOther = false

    // previous line segment in sweepline belongs to the same polygon
  } else {
    if (event.isSubject === prev.isSubject) {
      event.sweepLineEnters = !prev.sweepLineEnters
      event.isInsideOther = prev.isInsideOther

      // previous line segment in sweepline belongs to the clipping polygon
    } else {
      event.sweepLineEnters = !prev.isInsideOther
      event.isInsideOther = prev.isVertical()
        ? !prev.sweepLineEnters
        : prev.sweepLineEnters
    }
  }

  // check if the line segment belongs to the Boolean operation
  event.isInResult = isInResult(event, operation)
}

const isInResult = (event, operation) => {
  switch (event.edgeType) {
    case edgeType.NORMAL:
      switch (operation) {
        case operationType.INTERSECTION:
          return event.isInsideOther
        case operationType.UNION:
          return !event.isInsideOther
        case operationType.DIFFERENCE:
          return (
            (event.isSubject && !event.isInsideOther) ||
            (!event.isSubject && event.isInsideOther)
          )
        case operationType.XOR:
          return true
      }
      break
    case edgeType.SAME_TRANSITION:
      return (
        operation === operationType.INTERSECTION ||
        operation === operationType.UNION
      )
    case edgeType.DIFFERENT_TRANSITION:
      return operation === operationType.DIFFERENCE
    case edgeType.NON_CONTRIBUTING:
      return false
  }
  return false
}

module.exports = computeFields
