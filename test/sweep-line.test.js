/* eslint-env jest */

const SweepLine = require('../src/sweep-line')

const comparator = (a, b) => {
  if (a === b) return 0
  return a < b ? -1 : 1
}

describe('sweep line', () => {
  test('test filling up the tree then emptying it out', () => {
    const sl = new SweepLine(comparator)
    const k1 = 4
    const k2 = 9
    const k3 = 13
    const k4 = 44

    let n1 = sl._insert(k1)
    let n2 = sl._insert(k2)
    let n4 = sl._insert(k4)
    let n3 = sl._insert(k3)

    expect(sl._find(k1)).toBe(n1)
    expect(sl._find(k2)).toBe(n2)
    expect(sl._find(k3)).toBe(n3)
    expect(sl._find(k4)).toBe(n4)

    expect(sl._prevKey(n1)).toBeNull()
    expect(sl._nextKey(n1)).toBe(k2)

    expect(sl._prevKey(n2)).toBe(k1)
    expect(sl._nextKey(n2)).toBe(k3)

    expect(sl._prevKey(n3)).toBe(k2)
    expect(sl._nextKey(n3)).toBe(k4)

    expect(sl._prevKey(n4)).toBe(k3)
    expect(sl._nextKey(n4)).toBeNull()

    sl._remove(k2)
    expect(sl._find(k2)).toBeNull()

    n1 = sl._find(k1)
    n3 = sl._find(k3)
    n4 = sl._find(k4)

    expect(sl._prevKey(n1)).toBeNull()
    expect(sl._nextKey(n1)).toBe(k3)

    expect(sl._prevKey(n3)).toBe(k1)
    expect(sl._nextKey(n3)).toBe(k4)

    expect(sl._prevKey(n4)).toBe(k3)
    expect(sl._nextKey(n4)).toBeNull()

    sl._remove(k4)
    expect(sl._find(k4)).toBeNull()

    n1 = sl._find(k1)
    n3 = sl._find(k3)

    expect(sl._prevKey(n1)).toBeNull()
    expect(sl._nextKey(n1)).toBe(k3)

    expect(sl._prevKey(n3)).toBe(k1)
    expect(sl._nextKey(n3)).toBeNull()

    sl._remove(k1)
    expect(sl._find(k1)).toBeNull()

    n3 = sl._find(k3)

    expect(sl._prevKey(n3)).toBeNull()
    expect(sl._nextKey(n3)).toBeNull()

    sl._remove(k3)
    expect(sl._find(k3)).toBeNull()
  })
})
