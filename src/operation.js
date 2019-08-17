import SplayTree from 'splaytree'
import { getBboxOverlap } from './bbox'
import * as geomIn from './geom-in'
import * as geomOut from './geom-out'
import rounder from './rounder'
import SweepEvent from './sweep-event'
import SweepLine from './sweep-line'

export class Operation {
  run (type, geom, moreGeoms) {
    operation.type = type
    rounder.reset()

    /* Convert inputs to MultiPoly objects */
    const multipolys = [new geomIn.MultiPolyIn(geom, true)]
    for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
      multipolys.push(new geomIn.MultiPolyIn(moreGeoms[i], false))
    }
    operation.numMultiPolys = multipolys.length

    /* BBox optimization for difference operation
     * If the bbox of a multipolygon that's part of the clipping doesn't
     * intersect the bbox of the subject at all, we can just drop that
     * multiploygon. */
    if (operation.type === 'difference') {
      // in place removal
      const subject = multipolys[0]
      let i = 1
      while (i < multipolys.length) {
        if (getBboxOverlap(multipolys[i].bbox, subject.bbox) !== null) i++
        else multipolys.splice(i, 1)
      }
    }

    /* BBox optimization for intersection operation
     * If we can find any pair of multipolygons whose bbox does not overlap,
     * then the result will be empty. */
    if (operation.type === 'intersection') {
      // TODO: this is O(n^2) in number of polygons. By sorting the bboxes,
      //       it could be optimized to O(n * ln(n))
      for (let i = 0, iMax = multipolys.length; i < iMax; i++) {
        const mpA = multipolys[i]
        for (let j = i + 1, jMax = multipolys.length; j < jMax; j++) {
          if (getBboxOverlap(mpA.bbox, multipolys[j].bbox) === null) return []
        }
      }
    }

    /* Put segment endpoints in a priority queue */
    const queue = new SplayTree(SweepEvent.compare)
    for (let i = 0, iMax = multipolys.length; i < iMax; i++) {
      const sweepEvents = multipolys[i].getSweepEvents()
      for (let j = 0, jMax = sweepEvents.length; j < jMax; j++) {
        queue.insert(sweepEvents[j])
      }
    }

    /* Pass the sweep line over those endpoints */
    const sweepLine = new SweepLine(queue)
    let prevQueueSize = queue.size
    let node = queue.pop()
    while (node) {
      const evt = node.key
      if (queue.size === prevQueueSize) {
        // prevents an infinite loop, an otherwise common manifestation of bugs
        const seg = evt.segment
        throw new Error(
          `Unable to pop() ${evt.isLeft ? 'left' : 'right'} SweepEvent ` +
          `[${evt.point.x}, ${evt.point.y}] from segment #${seg.id} ` +
          `[${seg.leftSE.point.x}, ${seg.leftSE.point.y}] -> ` +
          `[${seg.rightSE.point.x}, ${seg.rightSE.point.y}] from queue. ` +
          'Please file a bug report.'
        )
      }
      const newEvents = sweepLine.process(evt)
      for (let i = 0, iMax = newEvents.length; i < iMax; i++) {
        const evt = newEvents[i]
        if (evt.consumedBy === undefined) queue.insert(evt)
      }
      prevQueueSize = queue.size
      node = queue.pop()
    }

    // free some memory we don't need anymore
    rounder.reset()

    /* Collect and compile segments we're keeping into a multipolygon */
    const ringsOut = geomOut.RingOut.factory(sweepLine.segments)
    const result = new geomOut.MultiPolyOut(ringsOut)
    return result.getGeom()
  }
}

// singleton available by import
const operation = new Operation()

export default operation
