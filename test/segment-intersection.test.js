/* eslint-env jest */

const intersection = require('../src/segment-intersection')

describe('intersection', () => {
  test('null if no intersections 1', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[1, 0], [2, 2]]
    expect(intersection(...a, ...b)).toBeNull()
  })

  test('null if no intersections 2', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[1, 0], [10, 2]]
    expect(intersection(...a, ...b)).toBeNull()
  })

  test('null if no intersections 3', () => {
    const a = [[2, 2], [3, 3]]
    const b = [[0, 6], [2, 4]]
    expect(intersection(...a, ...b)).toBeNull()
  })

  test('1 intersection', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[1, 0], [0, 1]]
    const inters = [[0.5, 0.5]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('shared point 1', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[0, 1], [0, 0]]
    const inters = [[0, 0]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('shared point 2', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[0, 1], [1, 1]]
    const inters = [[1, 1]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('T-crossing', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[0.5, 0.5], [1, 0]]
    const inters = [[0.5, 0.5]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = [[0, 0], [10, 10]]
    const b = [[1, 1], [5, 5]]
    const inters = [[1, 1], [5, 5]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('shared point + overlap', () => {
    const a = [[1, 1], [10, 10]]
    const b = [[1, 1], [5, 5]]
    const inters = [[1, 1], [5, 5]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('mutual overlap', () => {
    const a = [[3, 3], [10, 10]]
    const b = [[0, 0], [5, 5]]
    const inters = [[3, 3], [5, 5]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[0, 0], [1, 1]]
    const inters = [[0, 0], [1, 1]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('full overlap, orientation', () => {
    const a = [[1, 1], [0, 0]]
    const b = [[0, 0], [1, 1]]
    const inters = [[0, 0], [1, 1]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('collinear, shared point', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[1, 1], [2, 2]]
    const inters = [[1, 1]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('collinear, shared other point', () => {
    const a = [[1, 1], [0, 0]]
    const b = [[1, 1], [2, 2]]
    const inters = [[1, 1]]
    expect(intersection(...a, ...b)).toEqual(inters)
  })

  test('collinear, no overlap', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[2, 2], [4, 4]]
    expect(intersection(...a, ...b)).toBeNull()
  })

  test('parallel', () => {
    const a = [[0, 0], [1, 1]]
    const b = [[0, -1], [1, 0]]
    expect(intersection(...a, ...b)).toBeNull()
  })

  test('parallel, orientation', () => {
    const a = [[1, 1], [0, 0]]
    const b = [[0, -1], [1, 0]]
    expect(intersection(...a, ...b)).toBeNull()
  })

  test('parallel, position', () => {
    const a = [[0, -1], [1, 0]]
    const b = [[0, 0], [1, 1]]
    expect(intersection(...a, ...b)).toBeNull()
  })
})
