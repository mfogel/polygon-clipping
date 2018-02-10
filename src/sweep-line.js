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
