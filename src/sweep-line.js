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
  constructor (comparator = Segment.compare) {
    this.tree = new SplayTree(comparator)
    this.segments = []
  }

  process (event) {
    const segment = event.segment
    const newEvents = []
    const node = event.isLeft
      ? this.tree.insert(segment)
      : this.tree.find(segment)

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

      // did we get some intersections?
      if (newEvents.length > 0 || mySplitters.length > 0) {
        this.tree.remove(segment)

        if (mySplitters.length > 0) {
          // split ourselves
          const newEventsFromSplit = segment.split(mySplitters)
          for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
            newEvents.push(newEventsFromSplit[i])
          }
        }

        // Make sure sweep line ordering is totally consistent for later
        // use with the segment 'prev' pointers - re-do the current event.
        newEvents.push(event)
      } else {
        this.segments.push(segment)
        segment.registerPrev(prevSeg)
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


    // sometimes, becaues of rounding errors, we need to resort events in the queue
    // https://github.com/mfogel/polygon-clipping/issues/29
    for (let i = 0, iMax = newEvents.length; i < iMax; i++) {
      const evt = newEvents[i]
      if (! evt.isOrientationCorrect) evt.segment.swapEvents()
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
      // Sometimes, because of rounding errors, splitting segments can cause their
      // ordering to change, making them un-findable in the sweep line tree.
      // To avoid this, we remove and re-insert the segments while splitting.
      // Also, keep in mind coincidents can change while splitting. (re: #44)
      const nodes = []
      for (let i = 0, iMax = segment.coincidents.length; i < iMax; i++) {
        let node = this.tree.find(segment.coincidents[i])
        if (node !== null) {
          nodes.push(node)
          this.tree.remove(node.key)
        }
      }
      newEvents = segment.split(splitters)
      for (let i = 0, iMax = nodes.length; i < iMax; i++) {
        this.tree.insert(nodes[i].key)
      }
    }
    return newEvents
  }
}
