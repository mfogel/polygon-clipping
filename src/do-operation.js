const cleanInput = require('./clean-input.js')
const connectEdges = require('./connect-edges')
const fillQueue = require('./fill-queue')
const subdivideSegments = require('./subdivide-segments')

const doOperation = (subject, clipping, operation) => {
  cleanInput(subject)
  cleanInput(clipping)

  const eventQueue = fillQueue(subject, clipping, operation)

  const sortedEvents = subdivideSegments(
    eventQueue,
    subject,
    clipping,
    operation
  )

  const result = connectEdges(sortedEvents, operation)
  return result
}

module.exports = doOperation
