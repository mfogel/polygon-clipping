import Queue from 'qheap'
import * as cleanInput from './clean-input.js'
import * as geomIn from './geom-in_new.js'
import * as geomOut from './geom-out'
import operation from './operation'
import SweepEvent from './sweep-event'
import SweepLine from './sweep-line'

export default function doIt (operationType, geom, moreGeoms) {

  const sbbox = [Infinity, Infinity, -Infinity, -Infinity];
  const cbbox = [Infinity, Infinity, -Infinity, -Infinity];

  // Ensure all input features are multipolys
  const geoms = []
  cleanInput.forceMultiPoly(geom, geoms)
  for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
    cleanInput.forceMultiPoly(moreGeoms[i], geoms)
  }

  // /* Clean inputs */
  // for (let i = 0, iMax = geoms.length; i < iMax; i++) {
  //   cleanInput.cleanMultiPoly(geoms[i])
  // }
  const queue = new Queue({ comparBefore: SweepEvent.compareBefore })

  /* Convert inputs to MultiPoly objects, mark subject & register operation */
  const multipolys = []
  for (let i = 0, iMax = geoms.length; i < iMax; i++) {
    let bbox = i === 0 ? sbbox : cbbox
    multipolys.push(new geomIn.MultiPoly(geoms[i], bbox, queue))
  }

  multipolys[0].markAsSubject()
  operation.register(operationType, multipolys.length)

  const rightbound = Math.min(sbbox[2], cbbox[2]);

  // /* Put segment endpoints in a priority queue */
  // for (let i = 0, iMax = multipolys.length; i < iMax; i++) {
  //   const sweepEvents = multipolys[i].getSweepEvents()
  //   for (let j = 0, jMax = sweepEvents.length; j < jMax; j++) {
  //     queue.insert(sweepEvents[j])
  //   }
  // }



  /* Pass the sweep line over those endpoints */
  const sweepLine = new SweepLine()
  while (queue.length) {
    const event = queue.remove()

    // optimization by bboxes for intersection and difference goes here
    if ((operationType === 0 && event.point.x > rightbound) ||
        (operationType === 3 && event.point.x > sbbox[2])) {
      break;
    }

    const newEvents = sweepLine.process(event)

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
