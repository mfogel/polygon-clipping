const SplayTree = require('splaytree')
const { arePointsEqual } = require('./flp')
const Segment = require('./segment')

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

class SweepLine {
  constructor (comparator = Segment.compare) {
    this.tree = new SplayTree(comparator)
    this.segments = []
    this.prevEvent = null
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
        const prevInters = segment.getIntersections(prevSeg)
        if (prevInters.length > 0) {
          newEvents.push(...this._possibleSplit(prevSeg, prevInters))
          for (let i = 0; i < prevInters.length; i++) {
            const pt = prevInters[i]
            if (!segment.isAnEndpoint(pt)) mySplitters.push(pt)
          }
        }
      }

      // Check for intersections against the next segment in the sweep line
      if (nextSeg) {
        const nextInters = segment.getIntersections(nextSeg)
        if (nextInters.length > 0) {
          newEvents.push(...this._possibleSplit(nextSeg, nextInters))
          for (let i = 0; i < nextInters.length; i++) {
            const pt = nextInters[i]
            if (!segment.isAnEndpoint(pt)) mySplitters.push(pt)
          }
        }
      }

      // did we get some intersections?
      if (newEvents.length > 0 || mySplitters.length > 0) {
        this.tree.remove(segment)

        if (mySplitters.length > 0) {
          newEvents.push(...segment.split(mySplitters))
        }

        // Make sure sweep line ordering is totally consistent for later
        // use with the segment 'prev' pointers - re-do the current event.
        newEvents.push(event)
        return newEvents
      }

      this.segments.push(segment)
      segment.registerPrev(prevSeg)
    } else {
      // event.isRight

      // since we're about to be removed from the sweep line, check for
      // intersections between our previous and next segments
      if (prevSeg && nextSeg) {
        const inters = prevSeg.getIntersections(nextSeg)
        if (inters.length > 0) {
          newEvents.push(...this._possibleSplit(prevSeg, inters))
          newEvents.push(...this._possibleSplit(nextSeg, inters))
        }
      }

      this.tree.remove(segment)
    }

    if (this.prevEvent && arePointsEqual(this.prevEvent.point, event.point)) {
      this.prevEvent.link(event)
    }
    this.prevEvent = event

    return newEvents
  }

  _possibleSplit (segment, intersections) {
    const splitters = []
    for (let i = 0; i < intersections.length; i++) {
      const pt = intersections[i]
      if (!segment.isAnEndpoint(pt)) splitters.push(pt)
    }

    const newEvents = []
    if (splitters.length > 0) {
      this.tree.remove(segment)
      newEvents.push(...segment.split(splitters))
      this.tree.insert(segment)
    }
    return newEvents
  }
}

module.exports = SweepLine
