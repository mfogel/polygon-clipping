const cleanInput = require('./clean-input.js')
const EventQueue = require('./event-queue')
const operationTypes = require('./operation-types')
const SweepLine = require('./sweep-line')
const { MultiPoly, Ring } = require('./geom')

const doOperation = (subject, clipping, operationType) => {
  operationTypes.setActive(operationType)
  cleanInput(subject)
  cleanInput(clipping)

  /* Put segment endpoints in a priority queue */
  const eventQueue = new EventQueue()
  eventQueue.consume(subject, true)
  eventQueue.consume(clipping, false)

  /* Pass the sweep line over those endpoints */
  const sweepLine = new SweepLine()
  while (!eventQueue.isEmpty) {
    eventQueue.push(...sweepLine.process(eventQueue.pop()))
  }
  const segments = sweepLine.getResults()

  /* Collect the segments we're keeping in a series of rings */
  const rings = []
  segments.forEach(segment => {
    if (!segment.ring) rings.push(new Ring(segment))
  })

  /* Compile those rings into a multipolygon */
  const result = new MultiPoly(rings)
  return result.geom
}

module.exports = doOperation
