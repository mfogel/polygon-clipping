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

    if (event.isLeft) {
      const node = this._insert(segment)
      const prevSeg = this._prevKey(node)
      const nextSeg = this._nextKey(node)

      if (nextSeg) newEvents.push(...this._checkIntersection(segment, nextSeg))
      if (prevSeg) newEvents.push(...this._checkIntersection(prevSeg, segment))

      if (newEvents.length) {
        // Some segments have been split. To make our sweep line sorting
        // perfectly correct (used later via the segment 'previous' pointers to
        // determine which ring encloses which) we abort the processing of this
        // event, put all the events back in the queue and restart
        newEvents.push(event)
        this._remove(segment)
        return newEvents
      }

      this.segments.push(segment)
      segment.registerPrev(prevSeg)
    } else {
      // event.isRight
      const node = this._find(segment)
      const prevSeg = this._prevKey(node)
      const nextSeg = this._nextKey(node)

      if (nextSeg && segment.isCoincidentWith(nextSeg)) {
        segment.registerCoincidence(nextSeg)
      }

      this._remove(segment)

      if (prevSeg && nextSeg) {
        newEvents.push(...this._checkIntersection(prevSeg, nextSeg))
      }
    }

    if (this.prevEvent && arePointsEqual(this.prevEvent.point, event.point)) {
      this.prevEvent.link(event)
    }
    this.prevEvent = event

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

  _checkIntersection (seg1, seg2) {
    const inters = seg1.getIntersections(seg2)
    let splitOn
    if (inters.length === 0) return []
    if (inters.length === 1) splitOn = inters[0]
    if (inters.length === 2) {
      // we only need to split on first intersection that's not coincident
      // with the left event. The next intersection one will be handled
      // in another pass of the event loop.
      splitOn = arePointsEqual(seg1.leftSE.point, inters[0])
        ? inters[1]
        : inters[0]
    }

    const newEvents = []
    if (!seg1.isAnEndpoint(splitOn)) newEvents.push(...seg1.split(splitOn))
    if (!seg2.isAnEndpoint(splitOn)) newEvents.push(...seg2.split(splitOn))
    return newEvents
  }
}

module.exports = SweepLine
