/* Javascript doesn't do integer math. Everything is
 * floating point with percision Number.EPSILON.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
 */

/* Is a floating-point equal to b? */
const flpEQ = (a, b) => {
  // are they both 0?
  if (
    -Number.EPSILON < a &&
    a < Number.EPSILON &&
    -Number.EPSILON < b &&
    b < Number.EPSILON
  ) {
    return true
  }
  return (a - b) * (a - b) < Number.EPSILON * Number.EPSILON * a * b
}

/* FLP comparator */
const flpCompare = (a, b) => {
  if (flpEQ(a, b)) return 0
  return a < b ? -1 : 1
}

/* Is a floating-point less than b? */
const flpLT = (a, b) => flpCompare(a, b) < 0

/* Is a floating-point less or equal to than b? */
const flpLTE = (a, b) => flpCompare(a, b) <= 0

/* Are the two points floating-point equal? */
const arePointsEqual = (a, b) => flpEQ(a[0], b[0]) && flpEQ(a[1], b[1])

module.exports = { flpEQ, flpLT, flpLTE, flpCompare, arePointsEqual }
