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
class PtRounder {
  constructor () {
    this.reset()
  }

  reset () {
    this.xRounder = new CoordRounder()
    this.yRounder = new CoordRounder()
  }

  round (x, y) {
    return {
      x: this.xRounder.round(x),
      y: this.yRounder.round(y),
    }
  }
}

class CoordRounder {
  constructor () {
    this.tree = new SplayTree(cmp)
    // preseed with 0 so we don't end up with values < Number.EPSILON
    this.round(0)
  }

  // Note: this can rounds input values backwards or forwards.
  //       You might ask, why not restrict this to just rounding
  //       forwards? Wouldn't that allow left endpoints to always
  //       remain left endpoints during splitting (never change to
  //       right). No - it wouldn't, because we snap intersections
  //       to endpoints (to establish independence from the segment
  //       angle for t-intersections).
  round (coord) {
    const node = this.tree.add(coord)
    return node.key
  }
}

// singleton available by import
const rounder = new PtRounder()

export default rounder
