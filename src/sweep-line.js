const Tree = require('avl')
const Segment = require('./segment')

/**
 * NOTE:  It appears if you pull out a node from the AVL tree,
 *        then do a remove() on the tree, the nodes can get
 *        messed up: https://github.com/w8r/avl/issues/15
 *
 *        As such, the methods here which accept nodes back from
 *        the client will throw an exception if remove() has been
 *        called since that node was first given to the client.
 */

class SweepLine {
  constructor (comparator = Segment.compare) {
    this.tree = new Tree(comparator)
    this.removeCounter = 1
    this.sortedEvents = []
  }

  process (event) {
    this.sortedEvents.push(event)
    const segment = event.segment

    if (event.isLeft) {
      const node = this.insert(segment)
      const prevSeg = this.prevKey(node)
      const nextSeg = this.nextKey(node)

      event.registerPrevEvent(prevSeg ? prevSeg.leftSE : null)

      const newEvents = []
      if (nextSeg) newEvents.push(...this._checkIntersection(segment, nextSeg))
      if (prevSeg) newEvents.push(...this._checkIntersection(prevSeg, segment))
      return newEvents
    }

    if (event.isRight) {
      const node = this.find(segment)
      const nextSeg = this.nextKey(node)

      if (nextSeg && segment.isCoincidentWith(nextSeg)) {
        segment.leftSE.registerCoincidentEvent(nextSeg.leftSE, true)
        nextSeg.leftSE.registerCoincidentEvent(segment.leftSE, false)
      }

      this.remove(segment)
      return []
    }
  }

  getResults () {
    return this.sortedEvents
  }

  /* Returns the new node associated with the key */
  insert (key) {
    const node = this.tree.insert(key)
    return this._annotateNode(node)
  }

  /* Returns the node associated with the key */
  find (key, returnNeighbors = false) {
    const node = this.tree.find(key)
    return this._annotateNode(node)
  }

  prevKey (node) {
    this._checkNode(node)
    const prevNode = this.tree.prev(node)
    return prevNode ? prevNode.key : null
  }

  nextKey (node) {
    this._checkNode(node)
    const nextNode = this.tree.next(node)
    return nextNode ? nextNode.key : null
  }

  remove (key) {
    this.removeCounter++
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
      splitOn = seg1.leftSE.isPointEqual(inters[0]) ? inters[1] : inters[0]
    }
    return [...seg1.attemptSplit(splitOn), ...seg2.attemptSplit(splitOn)]
  }

  _checkNode (node) {
    /* defensively working around https://github.com/w8r/avl/issues/15 */
    if (node.removeCounter !== this.removeCounter) {
      throw new Error('Tried to use stale node')
    }
  }

  _annotateNode (node) {
    if (node !== null) node.removeCounter = this.removeCounter
    return node
  }
}

module.exports = SweepLine
