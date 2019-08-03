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
  const ab = a - b
  if (ab * ab < EPSILON_SQ * a * b) {
    return 0
  }

  // normal comparison
  return a < b ? -1 : 1
}
