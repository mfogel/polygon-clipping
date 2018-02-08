/* eslint-env jest */

const {
  arePointsColinear,
  arePointsEqual,
  areVectorsParallel,
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

describe('are vectors parallel', () => {
  describe('yes', () => {
    test('general', () => {
      const v1 = [1, 1]
      const v2 = [2, 2]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('reverse direction', () => {
      const v1 = [1, 1]
      const v2 = [-2, -2]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('horizontal', () => {
      const v1 = [1, 0]
      const v2 = [-2, 0]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('vertical', () => {
      const v1 = [0, 1]
      const v2 = [0, 2.23423]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('null vector', () => {
      // null vector is parallel to everything
      const v1 = [0, 1]
      const v2 = [0, 0]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('null vector with itself', () => {
      const v1 = [0, 0]
      expect(areVectorsParallel(v1, v1)).toBeTruthy()
    })
  })
  describe('no', () => {
    test('general', () => {
      const v1 = [1, 1]
      const v2 = [2, 4]
      expect(areVectorsParallel(v1, v2)).toBeFalsy()
    })
    test('perpendicular', () => {
      const v1 = [0, 1]
      const v2 = [0.5, 0]
      expect(areVectorsParallel(v1, v2)).toBeFalsy()
    })
  })
})

describe('are points colinear', () => {
  test('not enough points', () => {
    expect(arePointsColinear()).toBeTruthy()
    expect(arePointsColinear([0, 0])).toBeTruthy()
    expect(arePointsColinear([0, 0], [3, 4])).toBeTruthy()
  })
  describe('yes 3', () => {
    test('general', () => {
      expect(arePointsColinear([0, 0], [1, 1], [2, 2])).toBeTruthy()
      expect(arePointsColinear([-1, -1], [0, 0], [2, 2])).toBeTruthy()
      expect(arePointsColinear([-1, 0], [5, -6], [0, -1])).toBeTruthy()
    })
    test('repeated point', () => {
      expect(arePointsColinear([0, 0], [0, 0], [2, 2])).toBeTruthy()
      expect(arePointsColinear([1, 1], [1, 1], [1, 1])).toBeTruthy()
    })
    test('horizontal', () => {
      expect(arePointsColinear([-42.1, 0], [0, 0], [7, 0])).toBeTruthy()
    })
    test('vertical', () => {
      expect(arePointsColinear([0, -42.1], [0, 0], [0, 2])).toBeTruthy()
    })
  })
  describe('no 3', () => {
    test('general', () => {
      expect(arePointsColinear([0, 0], [-2, 1], [1, 8])).toBeFalsy()
    })
    test('perpendicular', () => {
      expect(arePointsColinear([0, 0], [0, 1], [1, 0])).toBeFalsy()
    })
  })
  describe('yes 4', () => {
    test('general', () => {
      expect(arePointsColinear([0, 0], [1, 1], [2, 2], [5, 5])).toBeTruthy()
      expect(arePointsColinear([-1, -1], [0, 0], [2, 2], [-5, -5])).toBeTruthy()
      expect(arePointsColinear([-1, 0], [5, -6], [0, -1], [-2, 1])).toBeTruthy()
    })
    test('repeated point', () => {
      expect(arePointsColinear([0, 0], [0, 0], [2, 2], [1, 1])).toBeTruthy()
      expect(arePointsColinear([1, 1], [1, 1], [1, 1], [1, 1])).toBeTruthy()
    })
  })
})
