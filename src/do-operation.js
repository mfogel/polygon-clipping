const cleanInput = require('./clean-input.js')
const geomOut = require('./geom-out')
const EventQueue = require('./event-queue')
const SweepLine = require('./sweep-line')
const operationTypes = require('./operation-types')

// TODO: change this to actually accept multiple subjects
const doOperation = (operationType, ...geoms) => {
  operationTypes.setActive(operationType)
  geoms.forEach(g => cleanInput.forceMultiPoly(g))
  geoms.forEach(g => cleanInput.closeAllRings(g))

  /* Put segment endpoints in a priority queue */
  const eventQueue = new EventQueue()
  eventQueue.consume(geoms)

  /* Pass the sweep line over those endpoints */
  const sweepLine = new SweepLine()
  while (!eventQueue.isEmpty) {
    eventQueue.push(...sweepLine.process(eventQueue.pop()))
  }

  /* Self-intersecting input rings are ambigious */
  cleanInput.errorOnSelfIntersectingRings(sweepLine.segments)

  /* Collect the segments we're keeping in a series of rings */
  const ringsOut = []
  sweepLine.segments.forEach(segment => {
    if (!segment.isInResult || segment.ringOut) return
    ringsOut.push(new geomOut.Ring(segment))
  })

  /* Compile those rings into a multipolygon */
  const result = new geomOut.MultiPoly(ringsOut)
  return result.geom
}

module.exports = doOperation
