const edgeType = require('./edge-type')
const operationType = require('./operation')

const computeFields = (event, prev, operation) => {
  // compute inOut and otherInOut fields
  if (prev === null) {
    event.inOut = false
    event.otherInOut = true

    // previous line segment in sweepline belongs to the same polygon
  } else {
    if (event.isSubject === prev.isSubject) {
      event.inOut = !prev.inOut
      event.otherInOut = prev.otherInOut

      // previous line segment in sweepline belongs to the clipping polygon
    } else {
      event.inOut = !prev.otherInOut
      event.otherInOut = prev.isVertical() ? !prev.inOut : prev.inOut
    }
  }

  // check if the line segment belongs to the Boolean operation
  event.inResult = inResult(event, operation)
}

const inResult = (event, operation) => {
  switch (event.type) {
    case edgeType.NORMAL:
      switch (operation) {
        case operationType.INTERSECTION:
          return !event.otherInOut
        case operationType.UNION:
          return event.otherInOut
        case operationType.DIFFERENCE:
          return (
            (event.isSubject && event.otherInOut) ||
            (!event.isSubject && !event.otherInOut)
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
