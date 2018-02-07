const cleanInput = require('./clean-input.js')
const connectEdges = require('./connect-edges')
const fillQueue = require('./fill-queue')
const operationTypes = require('./operation-types')
const subdivideSegments = require('./subdivide-segments')

const doOperation = (subject, clipping, operationType) => {
  operationTypes.setActive(operationType)
  cleanInput(subject)
  cleanInput(clipping)

  const eventQueue = fillQueue(subject, clipping)

  const sortedEvents = subdivideSegments(eventQueue, subject, clipping)

  const result = connectEdges(sortedEvents)

  return result
}

module.exports = doOperation
