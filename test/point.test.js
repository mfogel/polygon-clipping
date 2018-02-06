/* eslint-env jest */

const {
  arePointsEqual,
  comparePoints,
  crossProduct,
  dotProduct
} = require('../src/point')

describe('compare points', () => {
  test('earlier X coord', () => expect(comparePoints([-1, 1], [0, 0])).toBe(-1))
  test('later X coord', () => expect(comparePoints([1, 0], [0, 1])).toBe(1))
  test('earlier Y coord', () => expect(comparePoints([0, -1], [0, 0])).toBe(-1))
  test('later Y coord', () => expect(comparePoints([0, 1], [0, 0])).toBe(1))
  test('equal coord', () => expect(comparePoints([1, 1], [1, 1])).toBe(0))
})

describe('are points equal', () => {
  test('yes', () => expect(arePointsEqual([0, 0], [0.0, 0, 0])).toBeTruthy())
  test('no', () => expect(arePointsEqual([0, 0], [1, 0])).toBeFalsy())
})

describe('cross product', () => {
  test('general ', () => expect(crossProduct([1, 2], [3, 4])).toEqual(-2))
})

describe('dot product', () => {
  test('general ', () => expect(dotProduct([1, 2], [3, 4])).toEqual(11))
})
