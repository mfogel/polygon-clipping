import { cmp } from './flp'

/**
 * A bounding box has the format:
 *
 *  { ll: { x: xmin, y: ymin }, ur: { x: xmax, y: ymax } }
 *
 */

export const isInBbox = (bbox, point) => {
  const xmin = bbox.ll.x
  const ymin = bbox.ll.y
  const xmax = bbox.ur.x
  const ymax = bbox.ur.y
  const xpt = point.x
  const ypt = point.y
  return (
    cmp(xmin, xpt) <= 0 &&
    cmp(xpt, xmax) <= 0 &&
    cmp(ymin, ypt) <= 0 &&
    cmp(ypt, ymax) <= 0
  )
}

export const doBboxesOverlap = (b1, b2) =>
  !(
    cmp(b2.ur.x, b1.ll.x) < 0 ||
    cmp(b1.ur.x, b2.ll.x) < 0 ||
    cmp(b2.ur.y, b1.ll.y) < 0 ||
    cmp(b1.ur.y, b2.ll.y) < 0
  )

/* Returns either null, or a bbox (aka an ordered pair of points)
 * If there is only one point of overlap, a bbox with identical points
 * will be returned */
export const getBboxOverlap = (b1, b2) => {
  if (!doBboxesOverlap(b1, b2)) return null

  // find the middle two X values
  const lowerX = b1.ll.x < b2.ll.x ? b2.ll.x : b1.ll.x
  const upperX = b1.ur.x < b2.ur.x ? b1.ur.x : b2.ur.x

  // find the middle two Y values
  const lowerY = b1.ll.y < b2.ll.y ? b2.ll.y : b1.ll.y
  const upperY = b1.ur.y < b2.ur.y ? b1.ur.y : b2.ur.y

  // put those middle values together to get the overlap
  return { ll: { x: lowerX, y: lowerY }, ur: { x: upperX, y: upperY } }
}

/* Returns a list of unique corners.
 * Will contain one, two or four points */
export const getUniqueCorners = bbox => {
  const xmin = bbox.ll.x
  const ymin = bbox.ll.y
  const xmax = bbox.ur.x
  const ymax = bbox.ur.y
  const xEq = cmp(xmin, xmax) === 0
  const yEq = cmp(ymin, ymax) === 0
  if (xEq && yEq) return [{ x: xmin, y: ymin }]
  if (xEq) return [{ x: xmin, y: ymin }, { x: xmin, y: ymax }]
  if (yEq) return [{ x: xmin, y: ymin }, { x: xmax, y: ymin }]
  return [
    { x: xmin, y: ymin },
    { x: xmin, y: ymax },
    { x: xmax, y: ymin },
    { x: xmax, y: ymax }
  ]
}
