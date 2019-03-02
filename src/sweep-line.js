import SplayTree from 'splaytree'
import Segment from './segment'
import SweepEvent from './sweep-event'

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
      if (event.isLeft) this.queue.remove(event.otherSE)
      else this.tree.remove(segment)
      return newEvents
    }

    const node = event.isLeft
      ? this.tree.insert(segment)
      : this.tree.find(segment)

    if (! node) throw new Error(
      `Unable to find segment #${segment.id} ` +
      `[${segment.leftSE.point.x}, ${segment.leftSE.point.y}] -> ` +
      `[${segment.rightSE.point.x}, ${segment.rightSE.point.y}] ` +
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

      // Check for intersections against the previous segment in the sweep line
      let prevMySplitter = null
      if (prevSeg) {
        const prevInter = prevSeg.getIntersection(segment)
        if (prevInter !== null) {
          if (!segment.isAnEndpoint(prevInter)) prevMySplitter = prevInter
          if (!prevSeg.isAnEndpoint(prevInter)) {
            const newEventsFromSplit = this._splitSafely(prevSeg, prevInter)
            for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
              newEvents.push(newEventsFromSplit[i])
            }
          }
        }
      }

      // Check for intersections against the next segment in the sweep line
      let nextMySplitter = null
      if (nextSeg) {
        const nextInter = nextSeg.getIntersection(segment)
        if (nextInter !== null) {
          if (!segment.isAnEndpoint(nextInter)) nextMySplitter = nextInter
          if (!nextSeg.isAnEndpoint(nextInter))  {
            const newEventsFromSplit = this._splitSafely(nextSeg, nextInter)
            for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
              newEvents.push(newEventsFromSplit[i])
            }
          }
        }
      }

      // For simplicity, even if we find more than one intersection we only
      // spilt on the 'earliest' (sweep-line style) of the intersections.
      // The other intersection will be handled in a future process().
      if (prevMySplitter !== null || nextMySplitter !== null) {

        let mySplitter = null
        if (prevMySplitter === null) mySplitter = nextMySplitter
        else if (nextMySplitter === null) mySplitter = prevMySplitter
        else {
          const cmpSplitters = SweepEvent.comparePoints(prevMySplitter, nextMySplitter)
          if (cmpSplitters < 0) mySplitter = prevMySplitter
          if (cmpSplitters > 0) mySplitter = nextMySplitter
          // the two splitters are the exact same point
          mySplitter = prevMySplitter
        }

        // Rounding errors can cause changes in ordering,
        // so remove afected segments and right sweep events before splitting
        this.queue.remove(segment.rightSE)
        newEvents.push(segment.rightSE)

        const newEventsFromSplit = segment.split(mySplitter)
        for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
          newEvents.push(newEventsFromSplit[i])
        }
      }

      if (newEvents.length > 0) {
        // We found some intersections, so re-do the current event to
        // make sure sweep line ordering is totally consistent for later
        // use with the segment 'prev' pointers
        this.tree.remove(segment)
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
    const newEvents = seg.split(pt)
    newEvents.push(rightSE)
    // splitting can trigger consumption
    if (seg.consumedBy === undefined) this.tree.insert(seg)
    return newEvents
  }
}
