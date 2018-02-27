const Tree = require('avl')
const { arePointsEqual } = require('./flp')
const Segment = require('./segment')

/**
 * NOTE:  It appears if you pull out a node from the AVL tree,
 *        then do a remove() on the tree, the nodes can get
 *        messed up: https://github.com/w8r/avl/issues/15
 *
 *        As such, the methods here are careful not to re-use
 *        any nodes they're holding on to after calling remove().
 *
 *        Also, we must be careful not to change any segments while
 *        they are in the AVL tree. AFAIK, there's no way to tell
 *        the AVL tree to rebalance itself - thus before splitting
 *        a segment that's in the tree, we remove it from the tree,
 *        do the split, then re-insert it.
 */

class SweepLine {
  constructor (comparator = Segment.compare) {
    this.tree = new Tree(comparator)
    this.segments = []
    this.prevEvent = null
  }

  process (event) {
    const segment = event.segment
    const newEvents = []
    const node = event.isLeft ? this._insert(segment) : this._find(segment)
    const prevSeg = this._prevKey(node)
    const nextSeg = this._nextKey(node)

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
        this._remove(segment)

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

      if (nextSeg && segment.isCoincidentWith(nextSeg)) {
        segment.registerCoincidence(nextSeg)
      }

      this._remove(segment)
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
      this._remove(segment)
      newEvents.push(...segment.split(splitters))
      this._insert(segment)
    }
    return newEvents
  }

  _insert (key) {
    return this.tree.insert(key)
  }

  _find (key) {
    return this.tree.find(key)
  }

  _prevKey (node) {
    const prevNode = this.tree.prev(node)
    return prevNode ? prevNode.key : null
  }

  _nextKey (node) {
    const nextNode = this.tree.next(node)
    return nextNode ? nextNode.key : null
  }

  _remove (key) {
    this.tree.remove(key)
  }
}

module.exports = SweepLine
