const Queue = require('qheap')
const box = require('./box.js')
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

  /* register operation, extract portions of input to operate on */
  operation.register(operationType, 1 + moreGeoms.length)
  const opBbox = operation.getOperationalBbox(geom, moreGeoms)
  const [inOpGeoms, notInOpGeoms] = box.split(opBbox, geom, moreGeoms)

  /* Convert inputs to MultiPoly objects, mark subject */
  const multipolys = []
  for (let i = 0, iMax = inOpGeoms.length; i < iMax; i++) {
    multipolys.push(new geomIn.MultiPoly(inOpGeoms[i]))
  }
  multipolys[0].markAsSubject()

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
  const resultGeom = new geomOut.MultiPoly(ringsOut).getGeom()

  /* Join that back up with the part that wasn't operated on */
  return box.join(resultGeom, notInOpGeoms)
}

module.exports = doIt
