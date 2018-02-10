/* eslint-env jest */

const { arePointsEqual, crossProduct, dotProduct } = require('../src/point')

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
