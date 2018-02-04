const subdivideSegments = require('./subdivide-segments')
const connectEdges = require('./connect-edges')
const fillQueue = require('./fill-queue')
const operations = require('./operation')

const EMPTY = []

const trivialOperation = (subject, clipping, operation) => {
  let result = null
  if (subject.length * clipping.length === 0) {
    if (operation === operations.INTERSECTION) {
      result = EMPTY
    } else if (operation === operations.DIFFERENCE) {
      result = subject
    } else if (operation === operations.UNION || operation === operations.XOR) {
      result = subject.length === 0 ? clipping : subject
    }
  }
  return result
}

const compareBBoxes = (subject, clipping, sbbox, cbbox, operation) => {
  let result = null
  if (
    sbbox[0] > cbbox[2] ||
    cbbox[0] > sbbox[2] ||
    sbbox[1] > cbbox[3] ||
    cbbox[1] > sbbox[3]
  ) {
    if (operation === operations.INTERSECTION) {
      result = EMPTY
    } else if (operation === operations.DIFFERENCE) {
      result = subject
    } else if (operation === operations.UNION || operation === operations.XOR) {
      result = subject.concat(clipping)
    }
  }
  return result
}

const booleanOp = (subject, clipping, operation) => {
  if (typeof subject[0][0][0] === 'number') {
    subject = [subject]
  }
  if (typeof clipping[0][0][0] === 'number') {
    clipping = [clipping]
  }
  let trivial = trivialOperation(subject, clipping, operation)
  if (trivial) {
    return trivial === EMPTY ? null : trivial
  }
  const sbbox = [Infinity, Infinity, -Infinity, -Infinity]
  const cbbox = [Infinity, Infinity, -Infinity, -Infinity]

  // console.time('fill queue');
  const eventQueue = fillQueue(subject, clipping, sbbox, cbbox, operation)
  // console.timeEnd('fill queue');

  trivial = compareBBoxes(subject, clipping, sbbox, cbbox, operation)
  if (trivial) {
    return trivial === EMPTY ? null : trivial
  }
  // console.time('subdivide edges');
  var sortedEvents = subdivideSegments(
    eventQueue,
    subject,
    clipping,
    sbbox,
    cbbox,
    operation
  )
  // console.timeEnd('subdivide edges');

  // console.time('connect vertices');
  let result = connectEdges(sortedEvents, operation)
  // console.timeEnd('connect vertices');
  return result
}

const union = (subject, clipping) =>
  booleanOp(subject, clipping, operations.UNION)

const difference = (subject, clipping) =>
  booleanOp(subject, clipping, operations.DIFFERENCE)

const xor = (subject, clipping) => booleanOp(subject, clipping, operations.XOR)

const intersection = (subject, clipping) =>
  booleanOp(subject, clipping, operations.INTERSECTION)

module.exports = { union, difference, xor, intersection }
