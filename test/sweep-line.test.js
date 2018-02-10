/* eslint-env jest */

const SweepLine = require('../src/sweep-line')

const comparator = (a, b) => {
  if (a === b) return 0
  return a < b ? -1 : 1
}

describe('sweep line', () => {
  test('fill it up then empty it out', () => {
    const sl = new SweepLine(comparator)
    const k1 = 4
    const k2 = 9
    const k3 = 13
    const k4 = 44

    let n1 = sl.insert(k1)
    let n2 = sl.insert(k2)
    let n4 = sl.insert(k4)
    let n3 = sl.insert(k3)

    expect(sl.find(k1)).toBe(n1)
    expect(sl.find(k2)).toBe(n2)
    expect(sl.find(k3)).toBe(n3)
    expect(sl.find(k4)).toBe(n4)

    expect(sl.prevKey(n1)).toBeNull()
    expect(sl.nextKey(n1)).toBe(k2)

    expect(sl.prevKey(n2)).toBe(k1)
    expect(sl.nextKey(n2)).toBe(k3)

    expect(sl.prevKey(n3)).toBe(k2)
    expect(sl.nextKey(n3)).toBe(k4)

    expect(sl.prevKey(n4)).toBe(k3)
    expect(sl.nextKey(n4)).toBeNull()

    sl.remove(k2)
    expect(sl.find(k2)).toBeNull()

    expect(() => sl.nextKey(n1)).toThrow()
    expect(() => sl.nextKey(n2)).toThrow()
    expect(() => sl.nextKey(n3)).toThrow()
    expect(() => sl.nextKey(n4)).toThrow()

    n1 = sl.find(k1)
    n3 = sl.find(k3)
    n4 = sl.find(k4)

    expect(sl.prevKey(n1)).toBeNull()
    expect(sl.nextKey(n1)).toBe(k3)

    expect(sl.prevKey(n3)).toBe(k1)
    expect(sl.nextKey(n3)).toBe(k4)

    expect(sl.prevKey(n4)).toBe(k3)
    expect(sl.nextKey(n4)).toBeNull()

    sl.remove(k4)
    expect(sl.find(k4)).toBeNull()

    expect(() => sl.prevKey(n1)).toThrow()
    expect(() => sl.prevKey(n3)).toThrow()
    expect(() => sl.prevKey(n4)).toThrow()

    n1 = sl.find(k1)
    n3 = sl.find(k3)

    expect(sl.prevKey(n1)).toBeNull()
    expect(sl.nextKey(n1)).toBe(k3)

    expect(sl.prevKey(n3)).toBe(k1)
    expect(sl.nextKey(n3)).toBeNull()

    sl.remove(k1)
    expect(sl.find(k1)).toBeNull()

    expect(() => sl.nextKey(n1)).toThrow()
    expect(() => sl.nextKey(n4)).toThrow()

    n3 = sl.find(k3)

    expect(sl.prevKey(n3)).toBeNull()
    expect(sl.nextKey(n3)).toBeNull()

    sl.remove(k3)
    expect(sl.find(k3)).toBeNull()
  })
})
