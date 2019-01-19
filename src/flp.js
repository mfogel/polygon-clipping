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

/* FLP point comparator, favors point encountered first by sweep line */
export const cmpPoints = (aPt, bPt) => {
  if (aPt === bPt) return 0

  // fist compare X, then compare Y
  let a = aPt.x
  let b = bPt.x

  // inlined version of cmp() for performance boost
  if (
    a <= -epsilon ||
    epsilon <= a ||
    b <= -epsilon ||
    epsilon <= b
  ) {
    const diff = a - b
    if (diff * diff >= EPSILON_SQ * a * b) {
      return a < b ? -1 : 1
    }
  }

  a = aPt.y
  b = bPt.y

  // inlined version of cmp() for performance boost
  if (
    a <= -epsilon ||
    epsilon <= a ||
    b <= -epsilon ||
    epsilon <= b
  ) {
    const diff = a - b
    if (diff * diff >= EPSILON_SQ * a * b) {
      return a < b ? -1 : 1
    }
  }

  // they're the same
  return 0
}
