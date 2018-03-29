/* Javascript doesn't do integer math. Everything is
 * floating point with percision Number.EPSILON.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
 */

// IE Polyfill
if (Number.EPSILON === undefined) Number.EPSILON = Math.pow(2, -52)

const EPSILON_SQ = Number.EPSILON * Number.EPSILON

/* FLP comparator */
const cmp = (a, b) => {
  // check if they're both 0
  if (-Number.EPSILON < a && a < Number.EPSILON) {
    if (-Number.EPSILON < b && b < Number.EPSILON) {
      return 0
    }
  }

  // check if they're flp equal
  if ((a - b) * (a - b) < EPSILON_SQ * a * b) {
    return 0
  }

  // normal comparison
  return a < b ? -1 : 1
}

/* FLP point comparator, favors point encountered first by sweep line */
const cmpPoints = (aPt, bPt) => {
  // fist compare X, then compare Y
  // inlined version of cmp here for performance boost
  for (let i = 0; i < 2; i++) {
    const a = aPt[i]
    const b = bPt[i]

    // check if they're both 0
    if (-Number.EPSILON < a && a < Number.EPSILON) {
      if (-Number.EPSILON < b && b < Number.EPSILON) {
        continue
      }
    }

    // check if they're flp equal
    const diff = a - b
    if (diff * diff < EPSILON_SQ * a * b) continue

    // normal comparison
    return a < b ? -1 : 1
  }

  // else they're the same
  return 0
}

module.exports = {
  cmp,
  cmpPoints
}
