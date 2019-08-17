/* eslint-env jest */

import { forceMultiPoly, pointsAsObjects } from '../src/clean-input'

describe('forceMultiPoly()', () => {
  test('throws error on non-array input', () => {
    expect(() => forceMultiPoly(4)).toThrow()
    expect(() => forceMultiPoly('4')).toThrow()
    expect(() => forceMultiPoly(null)).toThrow()
    expect(() => forceMultiPoly(undefined)).toThrow()
    expect(() => forceMultiPoly({})).toThrow()
  })

  test('throws error on point input', () => {
    const point = { x: 3, y: 4 }
    expect(() => forceMultiPoly(point)).toThrow()
  })

  test('throws error on ring input', () => {
    const ring = [
      { x: 3, y: 4 },
      { x: 4, y: 5 },
      { x: 5, y: 6 },
      { x: 3, y: 4 }
    ]
    expect(() => forceMultiPoly(ring)).toThrow()
  })

  test('throws error numbers too deep input', () => {
    // multipolygons are 4 deep, anything more than that is not valid
    const invalidGeom = [[[[{ x: 4, y: 5 }]]]]
    expect(() => forceMultiPoly(invalidGeom)).toThrow()
  })

  test('converts polygon to multipolygon', () => {
    const poly = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
    ]
    const expected = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    forceMultiPoly(poly)
    expect(poly).toEqual(expected)
  })

  test('multipoly input unchanged', () => {
    const poly = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    const expected = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    forceMultiPoly(poly)
    expect(poly).toEqual(expected)
  })

  test('empty multipoly input unchanged', () => {
    const poly = []
    const expected = []
    forceMultiPoly(poly)
    expect(poly).toEqual(expected)
  })
})

describe('pointsAsObjects()', () => {
  test('basic poly', () => {
    const input = [[[0, 0], [1, 0], [0, 1], [0, 0]]]
    const expected = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
    ]
    expect(pointsAsObjects(input)).toEqual(expected)
  })

  test('basic multipoly', () => {
    const input = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const expected = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    expect(pointsAsObjects(input)).toEqual(expected)
  })

  test('empty multipoly', () => {
    const input = []
    const expected = []
    expect(pointsAsObjects(input)).toEqual(expected)
  })

  test('empty of empties', () => {
    const input = [[]]
    expect(() => pointsAsObjects(input)).toThrow()
  })

  test('empty of empties of empties', () => {
    const input = [[[]]]
    expect(() => pointsAsObjects(input)).toThrow()
  })

  test('too shallow', () => {
    const input = [[0, 0], [1, 0], [0, 1], [0, 0]]
    expect(() => pointsAsObjects(input)).toThrow()
  })

  test('way too shallow', () => {
    const input = [0, 0]
    expect(() => pointsAsObjects(input)).toThrow()
  })

  test('wrong type', () => {
    const input = 0
    expect(() => pointsAsObjects(input)).toThrow()
  })

  test('too deep', () => {
    const input = [[[[[0, 0], [1, 0], [0, 1], [0, 0]]]]]
    expect(() => pointsAsObjects(input)).toThrow()
  })

  test('more than two coordinates multipolygon', () => {
    const input = [[[[[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 0]]]]]
    expect(() => pointsAsObjects(input)).toThrow('more than two coordinates')
  })

  test('more than two coordinates polygon', () => {
    const input = [[[[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 0]]]]
    expect(() => pointsAsObjects(input)).toThrow('more than two coordinates')
  })
})
