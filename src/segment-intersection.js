const {
  arePointsEqual,
  areVectorsParallel,
  crossProduct,
  getBbox,
  getBboxOverlap
} = require('./point')

/**
 * Finds the intersection (if any) between two line segments a and b, given the
 * line segments' end points a1, a2 and b1, b2.
 *
 * This algorithm is based on Schneider and Eberly.
 * http://www.cimec.org.ar/~ncalvo/Schneider_Eberly.pdf
 * Page 244.
 *
 * @param {Array.<Number>} a1 point of first line
 * @param {Array.<Number>} a2 point of first line
 * @param {Array.<Number>} b1 point of second line
 * @param {Array.<Number>} b2 point of second line
 * @returns {Array.<Array.<Number>>|Null} If the lines intersect, the point of
 * intersection. If they overlap, the two end points of the overlapping segment.
 * Otherwise, null.
 */
module.exports = function (a1, a2, b1, b2) {
  const va = [a2[0] - a1[0], a2[1] - a1[1]]
  const vb = [b2[0] - b1[0], b2[1] - b1[1]]
  const ve = [b1[0] - a1[0], b1[1] - a1[1]]

  // Check for line intersection. This works because of the properties of the
  // cross product -- specifically, two vectors are parallel if and only if the
  // cross product is the 0 vector. The full calculation involves relative error
  // to account for possible very small line segments. See Schneider & Eberly
  // for details.
  if (!areVectorsParallel(va, vb)) {
    // If they're not parallel, then (because these are line segments) they
    // still might not actually intersect. This code checks that the
    // intersection point of the lines is actually on both line segments.

    const toPoint = (p, s, d) => [p[0] + s * d[0], p[1] + s * d[1]]
    const krossVaVb = crossProduct(va, vb)

    // not on line segment a
    const s = crossProduct(ve, vb) / krossVaVb
    if (s < 0 || s > 1) return null

    // not on line segment b
    const t = crossProduct(ve, va) / krossVaVb
    if (t < 0 || t > 1) return null

    // on an endpoint of line segment a
    if (s === 0 || s === 1) return [toPoint(a1, s, va)]

    // on an endpoint of line segment b
    if (t === 0 || t === 1) return [toPoint(b1, t, vb)]

    return [toPoint(a1, s, va)]
  }

  // We have parallel segments. If they're colinear, ve
  // will also be parallel to va and vb
  if (!areVectorsParallel(va, ve)) return null

  // We have colinear segments. Intersections are either:
  //  * on zero points (no overlap)
  //  * on one point (segments touch on one end)
  //  * on two points (segments overlap)
  const [aBbox, bBbox] = [getBbox(a1, a2), getBbox(b1, b2)]
  const overlap = getBboxOverlap(aBbox, bBbox)
  if (overlap === null) return null
  if (arePointsEqual(...overlap)) return [overlap[0]]
  return overlap
}
