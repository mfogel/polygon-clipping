const cleanInput = require('./clean-input.js')
const EventQueue = require('./event-queue')
const geomIn = require('./geom-in')
const geomOut = require('./geom-out')
const operation = require('./operation')
const SweepLine = require('./sweep-line')

const doIt = (operationType, ...geoms) => {
  geoms.forEach(g => cleanInput.forceMultiPoly(g))
  geoms.forEach(g => cleanInput.cleanMultiPoly(g))

  const multipolys = geoms.map(geom => new geomIn.MultiPoly(geom))

  operation.setType(operationType)
  operation.setMultiPolys(multipolys)

  /* Put segment endpoints in a priority queue */
  const eventQueue = new EventQueue()
  multipolys.forEach(mp => mp.sweepEvents.forEach(se => eventQueue.push(se)))

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

module.exports = doIt
