/* eslint-env jest */

const intersection = require('../src/segment-intersection')

describe('intersection', () => {
  test('null if no intersections 1', () =>
    expect(intersection([0, 0], [1, 1], [1, 0], [2, 2])).toBeNull())

  test('null if no intersections 2', () =>
    expect(intersection([0, 0], [1, 1], [1, 0], [10, 2])).toBeNull())

  test('null if no intersections 3', () =>
    expect(intersection([2, 2], [3, 3], [0, 6], [2, 4])).toBeNull())

  test('1 intersection', () =>
    expect(intersection([0, 0], [1, 1], [1, 0], [0, 1])).toEqual([[0.5, 0.5]]))

  test('shared point 1', () =>
    expect(intersection([0, 0], [1, 1], [0, 1], [0, 0])).toEqual([[0, 0]]))

  test('shared point 2', () =>
    expect(intersection([0, 0], [1, 1], [0, 1], [1, 1])).toEqual([[1, 1]]))

  test('T-crossing', () =>
    expect(intersection([0, 0], [1, 1], [0.5, 0.5], [1, 0])).toEqual([
      [0.5, 0.5]
    ]))

  test('full overlap', () =>
    expect(intersection([0, 0], [10, 10], [1, 1], [5, 5])).toEqual([
      [1, 1],
      [5, 5]
    ]))

  test('shared point + overlap', () =>
    expect(intersection([1, 1], [10, 10], [1, 1], [5, 5])).toEqual([
      [1, 1],
      [5, 5]
    ]))

  test('mutual overlap', () =>
    expect(intersection([3, 3], [10, 10], [0, 0], [5, 5])).toEqual([
      [3, 3],
      [5, 5]
    ]))

  test('full overlap', () =>
    expect(intersection([0, 0], [1, 1], [0, 0], [1, 1])).toEqual([
      [0, 0],
      [1, 1]
    ]))

  test('full overlap, orientation', () =>
    expect(intersection([1, 1], [0, 0], [0, 0], [1, 1])).toEqual([
      [1, 1],
      [0, 0]
    ]))

  test('collinear, shared point', () =>
    expect(intersection([0, 0], [1, 1], [1, 1], [2, 2])).toEqual([[1, 1]]))

  test('collinear, shared other point', () =>
    expect(intersection([1, 1], [0, 0], [1, 1], [2, 2])).toEqual([[1, 1]]))

  test('collinear, no overlap', () =>
    expect(intersection([0, 0], [1, 1], [2, 2], [4, 4])).toBeNull())

  test('parallel', () =>
    expect(intersection([0, 0], [1, 1], [0, -1], [1, 0])).toBeNull())

  test('parallel, orientation', () =>
    expect(intersection([1, 1], [0, 0], [0, -1], [1, 0])).toBeNull())

  test('parallel, position', () =>
    expect(intersection([0, -1], [1, 0], [0, 0], [1, 1])).toBeNull())
})
