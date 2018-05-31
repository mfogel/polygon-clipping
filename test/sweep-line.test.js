/* eslint-env jest */

import SweepLine from '../src/sweep-line'

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

    let n1 = sl.tree.insert(k1)
    let n2 = sl.tree.insert(k2)
    let n4 = sl.tree.insert(k4)
    let n3 = sl.tree.insert(k3)

    expect(sl.tree.find(k1)).toBe(n1)
    expect(sl.tree.find(k2)).toBe(n2)
    expect(sl.tree.find(k3)).toBe(n3)
    expect(sl.tree.find(k4)).toBe(n4)

    expect(sl.tree.prev(n1)).toBeNull()
    expect(sl.tree.next(n1).key).toBe(k2)

    expect(sl.tree.prev(n2).key).toBe(k1)
    expect(sl.tree.next(n2).key).toBe(k3)

    expect(sl.tree.prev(n3).key).toBe(k2)
    expect(sl.tree.next(n3).key).toBe(k4)

    expect(sl.tree.prev(n4).key).toBe(k3)
    expect(sl.tree.next(n4)).toBeNull()

    sl.tree.remove(k2)
    expect(sl.tree.find(k2)).toBeNull()

    n1 = sl.tree.find(k1)
    n3 = sl.tree.find(k3)
    n4 = sl.tree.find(k4)

    expect(sl.tree.prev(n1)).toBeNull()
    expect(sl.tree.next(n1).key).toBe(k3)

    expect(sl.tree.prev(n3).key).toBe(k1)
    expect(sl.tree.next(n3).key).toBe(k4)

    expect(sl.tree.prev(n4).key).toBe(k3)
    expect(sl.tree.next(n4)).toBeNull()

    sl.tree.remove(k4)
    expect(sl.tree.find(k4)).toBeNull()

    n1 = sl.tree.find(k1)
    n3 = sl.tree.find(k3)

    expect(sl.tree.prev(n1)).toBeNull()
    expect(sl.tree.next(n1).key).toBe(k3)

    expect(sl.tree.prev(n3).key).toBe(k1)
    expect(sl.tree.next(n3)).toBeNull()

    sl.tree.remove(k1)
    expect(sl.tree.find(k1)).toBeNull()

    n3 = sl.tree.find(k3)

    expect(sl.tree.prev(n3)).toBeNull()
    expect(sl.tree.next(n3)).toBeNull()

    sl.tree.remove(k3)
    expect(sl.tree.find(k3)).toBeNull()
  })
})
