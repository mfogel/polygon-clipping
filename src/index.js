import Queue from 'qheap'
import * as cleanInput from './clean-input.js'
import * as geomIn from './geom-in'
import * as geomOut from './geom-out'
import operation from './operation'
import SweepEvent from './sweep-event'
import SweepLine from './sweep-line'

export default function doIt (operationType, geom, moreGeoms) {
  /* Make a copy of the input geometry with points as objects, for perf */
  const geoms = [cleanInput.pointsAsObjects(geom)]
  for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
    geoms.push(cleanInput.pointsAsObjects(moreGeoms[i]))
  }

  /* Clean inputs */
  for (let i = 0, iMax = geoms.length; i < iMax; i++) {
    cleanInput.forceMultiPoly(geoms[i])
    cleanInput.cleanMultiPoly(geoms[i])
  }

  /* Convert inputs to MultiPoly objects, mark subject & register operation */
  const multipolys = []
  for (let i = 0, iMax = geoms.length; i < iMax; i++) {
    multipolys.push(new geomIn.MultiPoly(geoms[i]))
  }
  multipolys[0].markAsSubject()
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
