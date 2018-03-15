const Queue = require('qheap')
const cleanInput = require('./clean-input.js')
const geomIn = require('./geom-in')
const geomOut = require('./geom-out')
const operation = require('./operation')
const SweepEvent = require('./sweep-event')
const SweepLine = require('./sweep-line')

const doIt = (operationType, geom, moreGeoms) => {
  cleanInput.forceMultiPoly(geom)
  cleanInput.cleanMultiPoly(geom)
  for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
    cleanInput.forceMultiPoly(moreGeoms[i])
    cleanInput.cleanMultiPoly(moreGeoms[i])
  }

  const multipolys = [new geomIn.MultiPoly(geom)]
  multipolys[0].markAsSubject()
  for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
    multipolys.push(new geomIn.MultiPoly(moreGeoms[i]))
  }
  operation.register(operationType, multipolys.length)

  /* Put segment endpoints in a priority queue */
  const queue = new Queue({ comparBefore: SweepEvent.compareBefore })
  for (let i = 0, iMax = multipolys.length; i < iMax; i++) {
    const sweepEvents = multipolys[i].getSweepEvents()
    for (let j = 0, jMax = sweepEvents.length; j < jMax; j++) {
      queue.insert(sweepEvents[j])
    }
  }

  /* Pass the sweep line over those endpoints */
  const sweepLine = new SweepLine()
  while (queue.length) {
    const newEvents = sweepLine.process(queue.remove())
    for (let i = 0, iMax = newEvents.length; i < iMax; i++) {
      queue.insert(newEvents[i])
    }
  }

  /* Self-intersecting input rings are ambigious */
  cleanInput.errorOnSelfIntersectingRings(sweepLine.segments)

  /* Collect the segments we're keeping in a series of rings */
  const ringsOut = []
  for (let i = 0, iMax = sweepLine.segments.length; i < iMax; i++) {
    const segment = sweepLine.segments[i]
    if (!segment.isInResult || segment.ringOut) continue
    ringsOut.push(new geomOut.Ring(segment))
  }

  /* Compile those rings into a multipolygon */
  const result = new geomOut.MultiPoly(ringsOut)
  return result.getGeom()
}

module.exports = doIt
