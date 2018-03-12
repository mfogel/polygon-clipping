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
    const getKey = node => (node ? node.key : null)
    const prevSeg = getKey(this.tree.prev(node))
    const nextSeg = getKey(this.tree.next(node))

    if (event.isLeft) {
      const mySplitters = []

      if (prevSeg) {
        const prevInters = segment.getIntersections(prevSeg)
        newEvents.push(...this._possibleSplit(prevSeg, prevInters))
        mySplitters.push(...prevInters.filter(pt => !segment.isAnEndpoint(pt)))
      }

      if (nextSeg) {
        const nextInters = segment.getIntersections(nextSeg)
        newEvents.push(...this._possibleSplit(nextSeg, nextInters))
        mySplitters.push(...nextInters.filter(pt => !segment.isAnEndpoint(pt)))
      }

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

      if (prevSeg && nextSeg) {
        const inters = prevSeg.getIntersections(nextSeg)
        newEvents.push(...this._possibleSplit(prevSeg, inters))
        newEvents.push(...this._possibleSplit(nextSeg, inters))
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
    const splitters = intersections.filter(pt => !segment.isAnEndpoint(pt))
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
