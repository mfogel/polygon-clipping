import { cmp, touch } from './flp'

/**
 * A bounding box has the format:
 *
 *  { ll: { x: xmin, y: ymin }, ur: { x: xmax, y: ymax } }
 *
 */

export const isInBbox = (bbox, point) => {
  return (
    cmp(bbox.ll.x, point.x) <= 0 &&
    cmp(point.x, bbox.ur.x) <= 0 &&
    cmp(bbox.ll.y, point.y) <= 0 &&
    cmp(point.y, bbox.ur.y) <= 0
  )
}

/* Greedy comparison with a bbox. A point is defined to 'touch'
 * a bbox if:
 *  - it is inside the bbox
 *  - it 'touches' one of the sides (another greedy comparison) */
export const touchesBbox = (bbox, point) => {
  return (
    (cmp(bbox.ll.x, point.x) <= 0 || touch(bbox.ll.x, point.x)) &&
    (cmp(point.x, bbox.ur.x) <= 0 || touch(point.x, bbox.ur.x)) &&
    (cmp(bbox.ll.y, point.y) <= 0 || touch(bbox.ll.y, point.y)) &&
    (cmp(point.y, bbox.ur.y) <= 0 || touch(point.y, bbox.ur.y))
  )
}

/* Returns either null, or a bbox (aka an ordered pair of points)
 * If there is only one point of overlap, a bbox with identical points
 * will be returned */
export const getBboxOverlap = (b1, b2) => {
  // check if the bboxes overlap at all
  if (
      cmp(b2.ur.x, b1.ll.x) < 0 ||
      cmp(b1.ur.x, b2.ll.x) < 0 ||
      cmp(b2.ur.y, b1.ll.y) < 0 ||
      cmp(b1.ur.y, b2.ll.y) < 0
    ) return null

  // find the middle two X values
  const lowerX = b1.ll.x < b2.ll.x ? b2.ll.x : b1.ll.x
  const upperX = b1.ur.x < b2.ur.x ? b1.ur.x : b2.ur.x

  // find the middle two Y values
  const lowerY = b1.ll.y < b2.ll.y ? b2.ll.y : b1.ll.y
  const upperY = b1.ur.y < b2.ur.y ? b1.ur.y : b2.ur.y

  // put those middle values together to get the overlap
  return { ll: { x: lowerX, y: lowerY }, ur: { x: upperX, y: upperY } }
}
