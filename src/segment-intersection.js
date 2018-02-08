const {
  arePointsColinear,
  arePointsEqual,
  areVectorsParallel,
  crossProduct
} = require('./point')
const { getBbox, getBboxOverlap, getOtherCorners } = require('./bbox')

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
 * @returns {Array.<Array.<Number>> Array of the intersection points. Will be
 * either empty, contain one point, or two points (in the case of overlapping
 * segments, the 'intersections' are defined to be the endpoints of the overlap.)
 */
module.exports = function (a1, a2, b1, b2) {
  // If bboxes don't overlap, there can't be any intersections
  const [aBbox, bBbox] = [getBbox(a1, a2), getBbox(b1, b2)]
  const bboxOverlap = getBboxOverlap(aBbox, bBbox)
  if (bboxOverlap === null) return []

  const va = [a2[0] - a1[0], a2[1] - a1[1]]
  const vb = [b2[0] - b1[0], b2[1] - b1[1]]

  if (areVectorsParallel(va, vb)) {
    // parallel segments that aren't colinear can't intersect
    if (!arePointsColinear(a1, a2, b1, b2)) return []

    // colinear segments with just a point of bbox overlap
    // that point must be the one and only intersection
    if (arePointsEqual(...bboxOverlap)) return [bboxOverlap[0]]

    // We have colinear segments with overlap - thus two intersections.
    // The only question is which two oposing corners of the overlap bbox
    // are the intersections.
    const goesUpAndToTheRight = aBbox.some(pt => arePointsEqual(a1, pt))
    return goesUpAndToTheRight ? bboxOverlap : getOtherCorners(bboxOverlap)
  }

  // General case with non-parallel segments.
  const krossVaVb = crossProduct(va, vb)
  const ve = [b1[0] - a1[0], b1[1] - a1[1]]

  // not on line segment a
  const s = crossProduct(ve, vb) / krossVaVb
  if (s < 0 || s > 1) return []

  // on an endpoint of line segment a
  if (s === 0) return [a1]
  if (s === 1) return [a2]

  // not on line segment b
  const t = crossProduct(ve, va) / krossVaVb
  if (t < 0 || t > 1) return []

  // on an endpoint of line segment b
  if (t === 0) return [b1]
  if (t === 1) return [b2]

  // intersection is in a midpoint of both lines, let's use a
  return [[a1[0] + s * va[0], a1[1] + s * va[1]]]
}
