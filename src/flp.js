/* Javascript doesn't do integer math. Everything is
 * floating point with percision Number.EPSILON.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
 */

let epsilon = Number.EPSILON

// IE Polyfill
if (epsilon === undefined) epsilon = Math.pow(2, -52)

const EPSILON_SQ = epsilon * epsilon

/* FLP comparator */
export const cmp = (a, b) => {
  // check if they're both 0
  if (-epsilon < a && a < epsilon) {
    if (-epsilon < b && b < epsilon) {
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

/* Greedy comparison. Two numbers are defined to touch
 * if their midpoint is indistinguishable from either. */
export const touch = (a, b) => {
  const m = (a + b) / 2
  return cmp(m, a) === 0 || cmp(m, b) === 0
}

/* Greedy comparison. Two points are defined to touch
 * if their midpoint is indistinguishable from either. */
export const touchPoints = (aPt, bPt) => {
  // call directly to (skip touch()) cmp() for performance boost
  const mx = (aPt.x + bPt.x) / 2
  const aXMiss = cmp(mx, aPt.x) !== 0
  if (aXMiss && cmp(mx, bPt.x) !== 0) return false

  const my = (aPt.y + bPt.y) / 2
  const aYMiss = cmp(my, aPt.y) !== 0
  if (aYMiss && cmp(my, bPt.y) !== 0) return false

  // we have touching on both x & y, we have to make sure it's
  // not just on opposite points thou
  if (aYMiss && aYMiss) return true
  if (!aYMiss && !aYMiss) return true
  return false
}
