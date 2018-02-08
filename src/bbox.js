/**
 * A bounding box has the format:
 *
 *  [ [ xmin, ymin ] , [ xmax, ymax ] ]
 *
 */

const isInBbox = (point, bbox) => {
  const [[xmin, ymin], [xmax, ymax], [xpt, ypt]] = [...bbox, point]
  return xmin <= xpt && xpt <= xmax && ymin <= ypt && ypt <= ymax
}

const getBbox = (...points) => {
  if (points.length === 0) {
    throw new Error('At least one point is required to calc bbox')
  }
  const bbox = [
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
  ]
  const reducer = (bbox, point) => {
    bbox[0][0] = Math.min(bbox[0][0], point[0])
    bbox[0][1] = Math.min(bbox[0][1], point[1])
    bbox[1][0] = Math.max(bbox[1][0], point[0])
    bbox[1][1] = Math.max(bbox[1][1], point[1])
    return bbox
  }
  return points.reduce(reducer, bbox)
}

const doBboxesOverlap = (b1, b2) =>
  !(
    b1[0][0] > b2[1][0] ||
    b2[0][0] > b1[1][0] ||
    b1[0][1] > b2[1][1] ||
    b2[0][1] > b1[1][1]
  )

/* Returns either null, or a bbox (aka an ordered pair of points)
 * If there is only one point of overlap, a bbox with identical points
 * will be returned */
const getBboxOverlap = (b1, b2) => {
  if (!doBboxesOverlap(b1, b2)) return null

  const xs = [b1[0][0], b1[1][0], b2[0][0], b2[1][0]]
  const ys = [b1[0][1], b1[1][1], b2[0][1], b2[1][1]]

  const compareNums = (a, b) => a - b
  const [x1, x2] = xs.sort(compareNums).slice(1, 3)
  const [y1, y2] = ys.sort(compareNums).slice(1, 3)

  return [[x1, y1], [x2, y2]]
}

module.exports = { doBboxesOverlap, getBbox, getBboxOverlap, isInBbox }
