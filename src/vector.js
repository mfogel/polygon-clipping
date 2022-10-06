import { orient2d } from "robust-predicates/umd/orient2d"

/* Cross Product of two vectors with first point at origin */
export const crossProduct = (a, b) => a.x * b.y - a.y * b.x

/* Dot Product of two vectors with first point at origin */
export const dotProduct = (a, b) => a.x * b.x + a.y * b.y

/* Comparator for two vectors with same starting point */
export const compareVectorAngles = (basePt, endPt1, endPt2) => {
  const res = orient2d(
    basePt.x,
    basePt.y,
    endPt1.x,
    endPt1.y,
    endPt2.x,
    endPt2.y,
  )
  if (res > 0) return -1
  if (res < 0) return 1
  return 0
}

export const length = (v) => Math.sqrt(dotProduct(v, v))

/* Get the sine of the angle from pShared -> pAngle to pShaed -> pBase */
export const sineOfAngle = (pShared, pBase, pAngle) => {
  const vBase = { x: pBase.x - pShared.x, y: pBase.y - pShared.y }
  const vAngle = { x: pAngle.x - pShared.x, y: pAngle.y - pShared.y }
  return crossProduct(vAngle, vBase) / length(vAngle) / length(vBase)
}

/* Get the cosine of the angle from pShared -> pAngle to pShaed -> pBase */
export const cosineOfAngle = (pShared, pBase, pAngle) => {
  const vBase = { x: pBase.x - pShared.x, y: pBase.y - pShared.y }
  const vAngle = { x: pAngle.x - pShared.x, y: pAngle.y - pShared.y }
  return dotProduct(vAngle, vBase) / length(vAngle) / length(vBase)
}

/* Get the closest point on an line (defined by two points)
 * to another point. */
export const closestPoint = (ptA1, ptA2, ptB) => {
  if (ptA1.x === ptA2.x) return { x: ptA1.x, y: ptB.y } // vertical vector
  if (ptA1.y === ptA2.y) return { x: ptB.x, y: ptA1.y } // horizontal vector

  // determinne which point is further away
  // we use the further point as our base in the calculation, so that the
  // vectors are more parallel, providing more accurate dot product
  const v1 = { x: ptB.x - ptA1.x, y: ptB.y - ptA1.y }
  const v2 = { x: ptB.x - ptA2.x, y: ptB.y - ptA2.y }
  let vFar, vA, farPt
  if (dotProduct(v1, v1) > dotProduct(v2, v2)) {
    vFar = v1
    vA = { x: ptA2.x - ptA1.x, y: ptA2.y - ptA1.y }
    farPt = ptA1
  } else {
    vFar = v2
    vA = { x: ptA1.x - ptA2.x, y: ptA1.y - ptA2.y }
    farPt = ptA2
  }

  // manually test if the current point can be considered to be on the line
  // If the X coordinate was on the line, would the Y coordinate be as well?
  const xDist = (ptB.x - farPt.x) / vA.x
  if (ptB.y === farPt.y + xDist * vA.y) return ptB

  // If the Y coordinate was on the line, would the X coordinate be as well?
  const yDist = (ptB.y - farPt.y) / vA.y
  if (ptB.x === farPt.x + yDist * vA.x) return ptB

  // current point isn't exactly on line, so return closest point
  const dist = dotProduct(vA, vFar) / dotProduct(vA, vA)
  return { x: farPt.x + dist * vA.x, y: farPt.y + dist * vA.y }
}

/* Get the x coordinate where the given line (defined by a point and vector)
 * crosses the horizontal line with the given y coordiante.
 * In the case of parrallel lines (including overlapping ones) returns null. */
export const horizontalIntersection = (pt, v, y) => {
  if (v.y === 0) return null
  return { x: pt.x + (v.x / v.y) * (y - pt.y), y: y }
}

/* Get the y coordinate where the given line (defined by a point and vector)
 * crosses the vertical line with the given x coordiante.
 * In the case of parrallel lines (including overlapping ones) returns null. */
export const verticalIntersection = (pt, v, x) => {
  if (v.x === 0) return null
  return { x: x, y: pt.y + (v.y / v.x) * (x - pt.x) }
}

/* Get the intersection of two lines, each defined by a base point and a vector.
 * In the case of parrallel lines (including overlapping ones) returns null. */
export const intersection = (pt1, v1, pt2, v2) => {
  // take some shortcuts for vertical and horizontal lines
  // this also ensures we don't calculate an intersection and then discover
  // it's actually outside the bounding box of the line
  if (v1.x === 0) return verticalIntersection(pt2, v2, pt1.x)
  if (v2.x === 0) return verticalIntersection(pt1, v1, pt2.x)
  if (v1.y === 0) return horizontalIntersection(pt2, v2, pt1.y)
  if (v2.y === 0) return horizontalIntersection(pt1, v1, pt2.y)

  // General case for non-overlapping segments.
  // This algorithm is based on Schneider and Eberly.
  // http://www.cimec.org.ar/~ncalvo/Schneider_Eberly.pdf - pg 244

  const kross = crossProduct(v1, v2)
  if (kross == 0) return null

  const ve = { x: pt2.x - pt1.x, y: pt2.y - pt1.y }
  const d1 = crossProduct(ve, v1) / kross
  const d2 = crossProduct(ve, v2) / kross

  // take the average of the two calculations to minimize rounding error
  const x1 = pt1.x + d2 * v1.x,
    x2 = pt2.x + d1 * v2.x
  const y1 = pt1.y + d2 * v1.y,
    y2 = pt2.y + d1 * v2.y
  const x = (x1 + x2) / 2
  const y = (y1 + y2) / 2
  return { x: x, y: y }
}

/* Given a vector, return one that is perpendicular */
export const perpendicular = (v) => {
  return { x: -v.y, y: v.x }
}
