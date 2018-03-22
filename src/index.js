const Queue = require('qheap')
const cleanInput = require('./clean-input.js')
const geomIn = require('./geom-in')
const geomOut = require('./geom-out')
const operation = require('./operation')
const SweepEvent = require('./sweep-event')
const SweepLine = require('./sweep-line')

const doIt = (operationType, geom, moreGeoms) => {
  /* Clean inputs */
  cleanInput.forceMultiPoly(geom)
  cleanInput.cleanMultiPoly(geom)
  for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
    cleanInput.forceMultiPoly(moreGeoms[i])
    cleanInput.cleanMultiPoly(moreGeoms[i])
  }

  /* Convert inputs to MultiPoly objects, mark subject & register operation */
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

  /* Error on self-crossing input rings */
  cleanInput.errorOnSelfIntersectingRings(sweepLine.segments)

  /* Collect and compile segments we're keeping into a multipolygon */
  const ringsOut = geomOut.Ring.factory(sweepLine.segments)
  const result = new geomOut.MultiPoly(ringsOut)
  return result.getGeom()
}

module.exports = doIt
