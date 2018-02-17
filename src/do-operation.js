const cleanInput = require('./clean-input.js')
const EventQueue = require('./event-queue')
const SweepLine = require('./sweep-line')
const operationTypes = require('./operation-types')
const { MultiPoly, Ring } = require('./geom')

// TODO: change this to actually accept multiple subjects
const doOperation = (operationType, subject, clipping = null) => {
  operationTypes.setActive(operationType)
  const subjects = [subject]

  subjects.forEach(s => cleanInput(s))
  if (clipping) cleanInput(clipping)

  /* Put segment endpoints in a priority queue */
  const eventQueue = new EventQueue()
  subjects.forEach(s => eventQueue.consume(s, false))
  if (clipping) eventQueue.consume(clipping, true)

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
