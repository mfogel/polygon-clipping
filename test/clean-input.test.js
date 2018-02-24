/* eslint-env jest */

const { closeAllRings, forceMultiPoly } = require('../src/clean-input')

const deepCopyArray = input => {
  if (Array.isArray(input)) return input.map(deepCopyArray)
  else return input
}

describe('forceMultiPoly()', () => {
  test('throws error on non-array input', () => {
    expect(() => forceMultiPoly(4)).toThrow()
    expect(() => forceMultiPoly('4')).toThrow()
    expect(() => forceMultiPoly(null)).toThrow()
    expect(() => forceMultiPoly(undefined)).toThrow()
    expect(() => forceMultiPoly({})).toThrow()
  })

  test('throws error on point input', () => {
    const point = [3, 4]
    expect(() => forceMultiPoly(point)).toThrow()
  })

  test('throws error on ring input', () => {
    const ring = [[3, 4], [4, 5], [5, 6], [3, 4]]
    expect(() => forceMultiPoly(ring)).toThrow()
  })

  test('throws error numbers too deep input', () => {
    // multipolygons are 4 deep, anything more than that is not valid
    const invalidGeom = [[[[[4, 5]]]]]
    expect(() => forceMultiPoly(invalidGeom)).toThrow()
  })

  test('converts polygon to multipolygon', () => {
    const poly = [[[0, 0], [1, 0], [0, 1], [0, 0]]]
    const expected = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    forceMultiPoly(poly)
    expect(poly).toEqual(expected)
  })

  test('multipoly input unchanged', () => {
    const poly = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const expected = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    forceMultiPoly(poly)
    expect(poly).toEqual(expected)
  })
})

describe('closeAllRings()', () => {
  test('adds closing elements to rings', () => {
    const openRings = [
      [[[0, 0], [1, 0], [0, 1]]],
      [[[0, 0], [2, 0], [0, 2]], [[0, 0], [1, 0], [0, 1]]]
    ]
    const closedRings = [
      [[[0, 0], [1, 0], [0, 1], [0, 0]]],
      [[[0, 0], [2, 0], [0, 2], [0, 0]], [[0, 0], [1, 0], [0, 1], [0, 0]]]
    ]
    closeAllRings(openRings)
    expect(openRings).toEqual(closedRings)
  })

  test('already standardized input unchanged', () => {
    const allGood = [
      [[[0, 0], [1, 0], [0, 1], [0, 0]]],
      [[[0, 0], [2, 0], [0, 2], [0, 0]], [[0, 0], [1, 0], [0, 1], [0, 0]]]
    ]
    const stillAllGood = deepCopyArray(allGood)
    closeAllRings(allGood)
    expect(allGood).toEqual(stillAllGood)
  })
})

describe('errorOnSelfIntersectingRings()', () => {
  // TODO
  // throw new Error(`Self-intersecting ring found at ${event.point}`)
})
