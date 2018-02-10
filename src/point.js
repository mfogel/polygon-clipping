const arePointsEqual = (a, b) => a[0] === b[0] && a[1] === b[1]

/* Cross Product of two vectors with first point at origin */
const crossProduct = (a, b) => a[0] * b[1] - a[1] * b[0]

/* Dot Product of two vectors with first point at origin */
const dotProduct = (a, b) => a[0] * b[0] + a[1] * b[1]

module.exports = { arePointsEqual, crossProduct, dotProduct }
