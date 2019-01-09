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
      `Unable to find segment #${segment.leftSE.id} ` +
      `[${segment.leftSE.point.x}, ${segment.leftSE.point.y}] -> ` +
      `[${segment.rightSE.point.x}, ${segment.rightSE.point.y}] ` +
      `in SweepLine tree. Please submit a bug report.`
    )

    const prevNode = this.tree.prev(node)
    const prevSeg = prevNode ? prevNode.key : null

    const nextNode = this.tree.next(node)
    const nextSeg = nextNode ? nextNode.key : null

    if (event.isLeft) {
      const mySplitters = []

      // Check for intersections against the previous segment in the sweep line
      if (prevSeg) {
        const prevInters = prevSeg.getIntersections(segment)
        if (prevInters.length > 0) {
          const newEventsFromSplit = this._possibleSplit(prevSeg, prevInters)
          for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
            newEvents.push(newEventsFromSplit[i])
          }
          for (let i = 0, iMax = prevInters.length; i < iMax; i++) {
            const pt = prevInters[i]
            if (!segment.isAnEndpoint(pt)) mySplitters.push(pt)
          }
        }
      }

      // Check for intersections against the next segment in the sweep line
      if (nextSeg) {
        const nextInters = nextSeg.getIntersections(segment)
        if (nextInters.length > 0) {
          const newEventsFromSplit = this._possibleSplit(nextSeg, nextInters)
          for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
            newEvents.push(newEventsFromSplit[i])
          }
          for (let i = 0, iMax = nextInters.length; i < iMax; i++) {
            const pt = nextInters[i]
            if (!segment.isAnEndpoint(pt)) mySplitters.push(pt)
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
        const inters = prevSeg.getIntersections(nextSeg)
        if (inters.length > 0) {
          let newEventsFromSplit = this._possibleSplit(prevSeg, inters)
          for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
            newEvents.push(newEventsFromSplit[i])
          }
          newEventsFromSplit = this._possibleSplit(nextSeg, inters)
          for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
            newEvents.push(newEventsFromSplit[i])
          }
        }
      }

      this.tree.remove(segment)
    }

    return newEvents
  }

  _possibleSplit (segment, intersections) {
    const splitters = []
    for (let i = 0, iMax = intersections.length; i < iMax; i++) {
      const pt = intersections[i]
      if (!segment.isAnEndpoint(pt)) splitters.push(pt)
    }
    let newEvents = []
    if (splitters.length > 0) {
      // Rounding errors can cause changes in ordering,
      // so remove afected segments and right sweep events before splitting
      // removeNode() doesn't work, so have re-find the seg
      // https://github.com/w8r/splay-tree/pull/5
      this.tree.remove(segment)
      const rightSE = segment.rightSE
      this.queue.remove(rightSE)
      newEvents = segment.split(splitters)
      newEvents.push(rightSE)
      this.tree.insert(segment)
    }
    return newEvents
  }
}
