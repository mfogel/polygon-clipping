import SplayTree from 'splaytree'
import Segment from './segment'

/**
 * NOTE:  We must be careful not to change any segments while
 *        they are in the SplayTree. AFAIK, there's no way to tell
 *        the tree to rebalance itself - thus before splitting
 *        a segment that's in the tree, we remove it from the tree,
 *        do the split, then re-insert it. (Even though splitting a
 *        segment *shouldn't* change its correct position in the
 *        sweep line tree, the reality is because of rounding errors,
 *        it sometimes does.)
 */

export default class SweepLine {
  constructor (queue, comparator = Segment.compare) {
    this.queue = queue
    this.tree = new SplayTree(comparator)
    this.segments = []
  }

  process (event) {
    const segment = event.segment
    const newEvents = []

    // if we've already been consumed by another segment,
    // clean up our body parts and get out
    if (event.consumedBy) {
      if (! event.isLeft) this.tree.remove(segment)
      return newEvents
    }

    const node = event.isLeft
      ? this.tree.insert(segment)
      : this.tree.find(segment)

    if (! node) throw new Error(
      'Unable to find segment ' +
      `#${segment.leftSE.id} [${segment.leftSE.point.x}, ${segment.leftSE.point.y}] -> ` +
      `#${segment.rightSE.id} [${segment.rightSE.point.x}, ${segment.rightSE.point.y}] ` +
      'in SweepLine tree. Please submit a bug report.'
    )

    let prevNode = node
    let nextNode = node
    let prevSeg = undefined
    let nextSeg = undefined

    // skip consumed segments still in tree
    while (prevSeg === undefined) {
      prevNode = this.tree.prev(prevNode)
      if (prevNode === null) prevSeg = null
      else if (prevNode.key.consumedBy === undefined) prevSeg = prevNode.key
    }

    // skip consumed segments still in tree
    while (nextSeg === undefined) {
      nextNode = this.tree.next(nextNode)
      if (nextNode === null) nextSeg = null
      else if (nextNode.key.consumedBy === undefined) nextSeg = nextNode.key
    }

    if (event.isLeft) {
      // TODO: would it make sense to just stop and bail out at the first time we're split?
      //       rather than split ourselves multiple times?
      const mySplitters = []

      // Check for intersections against the previous segment in the sweep line
      if (prevSeg) {
        const prevInter = prevSeg.getIntersection(segment)
        if (prevInter !== null) {
          if (!segment.isAnEndpoint(prevInter)) mySplitters.push(prevInter)
          if (!prevSeg.isAnEndpoint(prevInter)) {
            const newEventsFromSplit = this._splitSafely(prevSeg, prevInter)
            for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
              newEvents.push(newEventsFromSplit[i])
            }
          }
        }
      }

      // Check for intersections against the next segment in the sweep line
      if (nextSeg) {
        const nextInter = nextSeg.getIntersection(segment)
        if (nextInter !== null) {
          if (!segment.isAnEndpoint(nextInter)) mySplitters.push(nextInter)
          if (!nextSeg.isAnEndpoint(nextInter))  {
            const newEventsFromSplit = this._splitSafely(nextSeg, nextInter)
            for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
              newEvents.push(newEventsFromSplit[i])
            }
          }
        }
      }

      // did we get some intersections? split ourselves if need be
      if (newEvents.length > 0 || mySplitters.length > 0) {

        // Rounding errors can cause changes in ordering,
        // so remove afected segments and right sweep events before splitting
        this.tree.remove(segment)
        this.queue.remove(segment.rightSE)
        newEvents.push(segment.rightSE)

        if (mySplitters.length > 0) {
          const newEventsFromSplit = segment.split(mySplitters)
          for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
            newEvents.push(newEventsFromSplit[i])
          }
        }

        // Make sure sweep line ordering is totally consistent for later
        // use with the segment 'prev' pointers - re-do the current event.
        newEvents.push(event)

      } else {
        // done with left event
        this.segments.push(segment)
        segment.prev = prevSeg
      }

    } else {
      // event.isRight

      // since we're about to be removed from the sweep line, check for
      // intersections between our previous and next segments
      if (prevSeg && nextSeg) {
        const inter = prevSeg.getIntersection(nextSeg)
        if (inter !== null) {
          if (!prevSeg.isAnEndpoint(inter))  {
            const newEventsFromSplit = this._splitSafely(prevSeg, inter)
            for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
              newEvents.push(newEventsFromSplit[i])
            }
          }
          if (!nextSeg.isAnEndpoint(inter))  {
            const newEventsFromSplit = this._splitSafely(nextSeg, inter)
            for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
              newEvents.push(newEventsFromSplit[i])
            }
          }
        }
      }

      this.tree.remove(segment)
    }

    return newEvents
  }

  /* Safely split a segment that is currently in the datastructures
   * IE - a segment other than the one that is currently being processed. */
  _splitSafely(seg, pt) {
    // Rounding errors can cause changes in ordering,
    // so remove afected segments and right sweep events before splitting
    // removeNode() doesn't work, so have re-find the seg
    // https://github.com/w8r/splay-tree/pull/5
    this.tree.remove(seg)
    const rightSE = seg.rightSE
    this.queue.remove(rightSE)
    const newEvents = seg.split([pt])
    newEvents.push(rightSE)
    this.tree.insert(seg)
    return newEvents
  }
}
