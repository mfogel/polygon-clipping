const cleanInput = require('./clean-input.js')
const connectEdges = require('./connect-edges')
const EventQueue = require('./event-queue')
const operationTypes = require('./operation-types')
const subdivideSegments = require('./subdivide-segments')

const doOperation = (subject, clipping, operationType) => {
  operationTypes.setActive(operationType)
  cleanInput(subject)
  cleanInput(clipping)

  const eventQueue = new EventQueue()
  eventQueue.consume(subject, true)
  eventQueue.consume(clipping, false)

  const sortedEvents = subdivideSegments(eventQueue)

  const result = connectEdges(sortedEvents)

  return result
}

module.exports = doOperation
