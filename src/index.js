const subdivideSegments = require('./subdivide-segments')
const connectEdges = require('./connect-edges')
const fillQueue = require('./fill-queue')
const operations = require('./operation')

const booleanOp = (subject, clipping, operation) => {
  if (typeof subject[0][0][0] === 'number') {
    subject = [subject]
  }
  if (typeof clipping[0][0][0] === 'number') {
    clipping = [clipping]
  }

  const sbbox = [Infinity, Infinity, -Infinity, -Infinity]
  const cbbox = [Infinity, Infinity, -Infinity, -Infinity]

  // console.time('fill queue');
  const eventQueue = fillQueue(subject, clipping, sbbox, cbbox, operation)
  // console.timeEnd('fill queue');

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
