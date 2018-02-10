const Tree = require('avl')
const compareSegments = require('./compare-segments')

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
  constructor (comparator = compareSegments) {
    this.tree = new Tree(comparator)
    this.removeCounter = 1
    this.sortedEvents = []
  }

  process (event) {
    this.sortedEvents.push(event)

    if (event.isLeft) {
      const node = this.insert(event)
      const prev = this.prevKey(node)
      const next = this.nextKey(node)

      event.registerPrevEvent(prev)

      const newEvents = []
      if (next) newEvents.push(...this._checkIntersection(event, next))
      if (prev) newEvents.push(...this._checkIntersection(prev, event))
      return newEvents
    }

    if (event.isRight) {
      const leftEvent = event.otherSE
      const node = this.find(leftEvent)
      const nextEvent = this.nextKey(node)

      if (nextEvent && leftEvent.segment.isCoincidentWith(nextEvent.segment)) {
        leftEvent.registerCoincidentEvent(nextEvent, true)
        nextEvent.registerCoincidentEvent(leftEvent, false)
      }

      this.remove(leftEvent)
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

  _checkIntersection (se1, se2) {
    const inters = se1.segment.getIntersections(se2.segment)
    let splitOn
    if (inters.length === 0) return []
    if (inters.length === 1) splitOn = inters[0]
    if (inters.length === 2) {
      // we only need to split on first intersection that's not coincident
      // with the current event. The next intersection one will be handled
      // in another pass of the event loop.
      splitOn = se1.isPointEqual(inters[0]) ? inters[1] : inters[0]
    }
    return [
      ...se1.segment.attemptSplit(splitOn),
      ...se2.segment.attemptSplit(splitOn)
    ]
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
