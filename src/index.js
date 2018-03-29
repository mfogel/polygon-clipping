const Queue = require('qheap')
const box = require('./box.js')
const cleanInput = require('./clean-input.js')
const geomIn = require('./geom-in')
const geomOut = require('./geom-out')
const operation = require('./operation')
const SweepEvent = require('./sweep-event')
const SweepLine = require('./sweep-line')

const doIt = (operationType, geom, moreGeoms) => {
  /* Collect inputs */
  const geoms = [geom]
  for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
    geoms.push(moreGeoms[i])
  }

  /* Clean inputs */
  for (let i = 0, iMax = geoms.length; i < iMax; i++) {
    cleanInput.forceMultiPoly(geoms[i])
    cleanInput.cleanMultiPoly(geoms[i])
  }

  /* Check for empty inputs */
  const isResultEmpty = cleanInput.handleEmptyInputs(geoms, operationType)
  if (isResultEmpty) return []

  /* register operation, extract portions of input to operate on */
  operation.register(operationType, geoms)
  const [inOpGeoms, outOpGeoms] = box.splitAll(operation.bbox, geoms)

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
  return box.join(resultGeom, outOpGeoms)
}

module.exports = doIt
