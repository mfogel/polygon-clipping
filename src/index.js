const cleanInput = require('./clean-input.js')
const EventQueue = require('./event-queue')
const geomIn = require('./geom-in')
const geomOut = require('./geom-out')
const operation = require('./operation')
const SweepLine = require('./sweep-line')

const doIt = (operationType, ...geoms) => {
  for (let i = 0; i < geoms.length; i++) {
    cleanInput.forceMultiPoly(geoms[i])
    cleanInput.cleanMultiPoly(geoms[i])
  }

  const multipolys = []
  for (let i = 0; i < geoms.length; i++) {
    multipolys.push(new geomIn.MultiPoly(geoms[i]))
  }
  multipolys[0].markAsSubject()
  operation.register(operationType, multipolys.length)

  /* Put segment endpoints in a priority queue */
  const eventQueue = new EventQueue()
  for (let i = 0; i < multipolys.length; i++) {
    const sweepEvents = multipolys[i].getSweepEvents()
    for (let j = 0; j < sweepEvents.length; j++) {
      eventQueue.push(sweepEvents[j])
    }
  }

  /* Pass the sweep line over those endpoints */
  const sweepLine = new SweepLine()
  while (!eventQueue.isEmpty) {
    eventQueue.push(...sweepLine.process(eventQueue.pop()))
  }

  /* Self-intersecting input rings are ambigious */
  cleanInput.errorOnSelfIntersectingRings(sweepLine.segments)

  /* Collect the segments we're keeping in a series of rings */
  const ringsOut = []
  for (let i = 0; i < sweepLine.segments.length; i++) {
    const segment = sweepLine.segments[i]
    if (!segment.isInResult || segment.ringOut) continue
    ringsOut.push(new geomOut.Ring(segment))
  }

  /* Compile those rings into a multipolygon */
  const result = new geomOut.MultiPoly(ringsOut)
  return result.getGeom()
}

module.exports = doIt
