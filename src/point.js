const comparePoints = (a, b) => {
  // lower X comes first
  if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1

  // else lower Y comes first
  if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1

  // else they're the same
  return 0
}

const arePointsEqual = (a, b) => comparePoints(a, b) === 0

/* Cross Product of two vectors with first point at origin */
const crossProduct = (a, b) => a[0] * b[1] - a[1] * b[0]

/* Dot Product of two vectors with first point at origin */
const dotProduct = (a, b) => a[0] * b[0] + a[1] * b[1]

const isOnLine = (num, min, max) => min <= num && num <= max

const isInBbox = (point, bbox) =>
  isOnLine(point[0], bbox[0][0], bbox[1][0]) &&
  isOnLine(point[1], bbox[0][1], bbox[1][1])

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

const areVectorsParallel = (v1, v2) => {
  const kross = crossProduct(v1, v2)
  const sqrKross = kross * kross
  const sqrLenA = dotProduct(v1, v1)
  const sqrLenB = dotProduct(v2, v2)

  // Two vectors are parallel iff their cross product is null
  return sqrKross <= Number.EPSILON * sqrLenA * sqrLenB
}

module.exports = {
  comparePoints,
  arePointsEqual,
  areVectorsParallel,
  crossProduct,
  doBboxesOverlap,
  dotProduct,
  getBbox,
  getBboxOverlap,
  isInBbox
}
