const cleanInput = require('./clean-input.js')
const connectEdges = require('./connect-edges')
const EventQueue = require('./event-queue')
const operationTypes = require('./operation-types')
const SweepLine = require('./sweep-line')

const doOperation = (subject, clipping, operationType) => {
  operationTypes.setActive(operationType)
  cleanInput(subject)
  cleanInput(clipping)

  const eventQueue = new EventQueue()
  eventQueue.consume(subject, true)
  eventQueue.consume(clipping, false)

  const sweepLine = new SweepLine()
  while (!eventQueue.isEmpty) {
    eventQueue.push(...sweepLine.process(eventQueue.pop()))
  }
  const sortedEvents = sweepLine.getResults()

  const result = connectEdges(sortedEvents)
  return result
}

module.exports = doOperation
