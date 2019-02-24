import { cmp } from './flp'
import SplayTree from 'splaytree'

/**
 * This class rounds incoming values sufficiently so that
 * floating points problems are, for the most part, avoided.
 *
 * Incoming points are have their x & y values tested against
 * all previously seen x & y values. If either is 'too close'
 * to a previously seen value, it's value is 'snapped' to the
 * previously seen value.
 *
 * All points should be rounded by this class before being
 * stored in any data structures in the rest of this algorithm.
 */

class Rounder {
  constructor () {
    this.reset()
  }

  reset () {
    this.xVals = new SplayTree()
    this.yVals = new SplayTree()
  }

  round (x, y) {
    return {
      x: this.roundCoord(x, this.xVals),
      y: this.roundCoord(y, this.yVals),
    }
  }

  roundCoord (coord, tree) {
    const node = tree.add(coord)

    const prevNode = tree.prev(node)
    if (prevNode !== null && cmp(node.key, prevNode.key) === 0) {
      tree.remove(coord)
      return prevNode.key
    }

    const nextNode = tree.next(node)
    if (nextNode !== null && cmp(node.key, nextNode.key) === 0) {
      tree.remove(coord)
      return nextNode.key
    }

    return coord
  }
}

// singleton available by import
const rounder = new Rounder()

export default rounder
