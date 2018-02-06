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

module.exports = { comparePoints, arePointsEqual, crossProduct, dotProduct }
