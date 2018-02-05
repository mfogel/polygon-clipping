/* eslint-env jest */

const cleanInput = require('../src/clean-input')

const deepCopyArray = input => {
  if (Array.isArray(input)) return input.map(deepCopyArray)
  else return input
}

describe('clean input', () => {
  test('throws error on non-array input', () => {
    expect(() => cleanInput(4)).toThrow()
    expect(() => cleanInput('4')).toThrow()
    expect(() => cleanInput(null)).toThrow()
    expect(() => cleanInput(undefined)).toThrow()
    expect(() => cleanInput({})).toThrow()
  })

  test('throws error on point input', () => {
    const point = [3, 4]
    expect(() => cleanInput(point)).toThrow()
  })

  test('throws error on ring input', () => {
    const ring = [[3, 4], [4, 5], [5, 6], [3, 4]]
    expect(() => cleanInput(ring)).toThrow()
  })

  test('throws error numbers too deep input', () => {
    // multipolygons are 4 deep, anything more than that is not valid
    const invalidGeom = [[[[[4, 5]]]]]
    expect(() => cleanInput(invalidGeom)).toThrow()
  })

  test('converts polygon to multipolygon', () => {
    const poly = [[[0, 0], [1, 0], [0, 1], [0, 0]]]
    const expected = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    cleanInput(poly)
    expect(poly).toEqual(expected)
  })

  test('adds closing elements to rings', () => {
    const openRings = [
      [[[0, 0], [1, 0], [0, 1]]],
      [[[0, 0], [2, 0], [0, 2]], [[0, 0], [1, 0], [0, 1]]]
    ]
    const closedRings = [
      [[[0, 0], [1, 0], [0, 1], [0, 0]]],
      [[[0, 0], [2, 0], [0, 2], [0, 0]], [[0, 0], [1, 0], [0, 1], [0, 0]]]
    ]
    cleanInput(openRings)
    expect(openRings).toEqual(closedRings)
  })

  test('already standardized input unchanged', () => {
    const allGood = [
      [[[0, 0], [1, 0], [0, 1], [0, 0]]],
      [[[0, 0], [2, 0], [0, 2], [0, 0]], [[0, 0], [1, 0], [0, 1], [0, 0]]]
    ]
    const stillAllGood = deepCopyArray(allGood)
    cleanInput(allGood)
    expect(allGood).toEqual(stillAllGood)
  })
})
