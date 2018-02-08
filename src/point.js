// TODO: this is sweep-line specific. Move to that file?
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

/* Both input vectors are represented by a single point -
 * they are assumed to start at the origin */
const areVectorsParallel = (v1, v2) => {
  const kross = crossProduct(v1, v2)
  const sqrKross = kross * kross
  const sqrLenA = dotProduct(v1, v1)
  const sqrLenB = dotProduct(v2, v2)

  // Two vectors are parallel iff their cross product is null
  return sqrKross <= Number.EPSILON * sqrLenA * sqrLenB
}

/* Do the given points lie on a line? */
const arePointsColinear = (...points) => {
  if (points.length < 3) return true
  const v1 = [points[1][0] - points[0][0], points[1][1] - points[0][1]]
  const v2 = [points[2][0] - points[0][0], points[2][1] - points[0][1]]
  const first3 = areVectorsParallel(v1, v2)
  return points.length === 3
    ? first3
    : first3 && arePointsColinear(...points.slice(1))
}

module.exports = {
  comparePoints,
  arePointsEqual,
  arePointsColinear,
  areVectorsParallel,
  crossProduct,
  dotProduct
}
