/* Javascript doesn't do integer math. Everything is
 * floating point with percision Number.EPSILON.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
 */

let epsilon = Number.EPSILON

// IE Polyfill
if (epsilon === undefined) epsilon = Math.pow(2, -52)

/**
 * Floating point comparator.
 * @param {Number} a - value
 * @param {Number} b - value
 * @returns {Number} 0 when value a and b are equal, -1 when value a < b, 1 when value a > b
 */
export const cmp = (a, b) => {
  if (Math.abs(a - b) < epsilon) return 0

  // normal comparison
  return a < b ? -1 : 1
}
