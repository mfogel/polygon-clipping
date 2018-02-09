/* eslint-env jest */

const Segment = require('../src/segment')

describe('segment constructor', () => {
  test('cannot build segment with identical points', () => {
    const pt = [0, 5]
    expect(() => new Segment(pt, pt)).toThrow()
  })

  test('correct point on left and right 1', () => {
    const p1 = [0, 0]
    const p2 = [0, 1]
    const seg = new Segment(p1, p2)
    expect(seg.leftSE.point).toEqual(p1)
    expect(seg.rightSE.point).toEqual(p2)
  })

  test('correct point on left and right 1', () => {
    const p1 = [0, 0]
    const p2 = [-1, 0]
    const seg = new Segment(p1, p2)
    expect(seg.leftSE.point).toEqual(p2)
    expect(seg.rightSE.point).toEqual(p1)
  })

  test('is subject set 1', () => {
    const seg = new Segment([0, 0], [1, 0], true)
    expect(seg.leftSE.isSubject).toBeTruthy()
    expect(seg.rightSE.isSubject).toBeTruthy()
  })

  test('is subject set 2', () => {
    const seg = new Segment([0, 0], [1, 0], false)
    expect(seg.leftSE.isSubject).toBeFalsy()
    expect(seg.rightSE.isSubject).toBeFalsy()
  })
})

describe('segment getOtherSE', () => {
  test('left to right', () => {
    const seg = new Segment([0, 0], [1, 0], true)
    expect(seg.getOtherSE(seg.leftSE)).toBe(seg.rightSE)
    expect(seg.leftSE.otherSE).toBe(seg.rightSE)
  })

  test('right to left', () => {
    const seg = new Segment([0, 0], [1, 0], true)
    expect(seg.getOtherSE(seg.rightSE)).toBe(seg.leftSE)
    expect(seg.rightSE.otherSE).toBe(seg.leftSE)
  })

  test('doesnt work for Sweep Events that are from other Segments', () => {
    const seg1 = new Segment([0, 0], [1, 0], true)
    const seg2 = new Segment([0, 0], [1, 0], true)
    expect(() => seg1.getOtherSE(seg2.leftSE)).toThrow()
  })
})

describe('intersection', () => {
  test('no intersections 1', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([1, 0], [2, 2])
    expect(a.getIntersections(b)).toEqual([])
  })

  test('no intersections 2', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([1, 0], [10, 2])
    expect(a.getIntersections(b)).toEqual([])
  })

  test('no intersections 3', () => {
    const a = new Segment([2, 2], [3, 3])
    const b = new Segment([0, 6], [2, 4])
    expect(a.getIntersections(b)).toEqual([])
  })

  test('1 intersection', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([1, 0], [0, 1])
    const inters = [[0.5, 0.5]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('shared point 1', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0, 1], [0, 0])
    const inters = [[0, 0]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('shared point 2', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0, 1], [1, 1])
    const inters = [[1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('T-crossing', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0.5, 0.5], [1, 0])
    const inters = [[0.5, 0.5]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = new Segment([0, 0], [10, 10])
    const b = new Segment([1, 1], [5, 5])
    const inters = [[1, 1], [5, 5]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('shared point + overlap', () => {
    const a = new Segment([1, 1], [10, 10])
    const b = new Segment([1, 1], [5, 5])
    const inters = [[1, 1], [5, 5]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('mutual overlap', () => {
    const a = new Segment([3, 3], [10, 10])
    const b = new Segment([0, 0], [5, 5])
    const inters = [[3, 3], [5, 5]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0, 0], [1, 1])
    const inters = [[0, 0], [1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('full overlap, orientation', () => {
    const a = new Segment([1, 1], [0, 0])
    const b = new Segment([0, 0], [1, 1])
    const inters = [[0, 0], [1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('collinear, shared point', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([1, 1], [2, 2])
    const inters = [[1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('collinear, shared other point', () => {
    const a = new Segment([1, 1], [0, 0])
    const b = new Segment([1, 1], [2, 2])
    const inters = [[1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('collinear, one encloses other', () => {
    const a = new Segment([0, 0], [4, 4])
    const b = new Segment([1, 1], [2, 2])
    const inters = [[1, 1], [2, 2]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('collinear, one encloses other 2', () => {
    const a = new Segment([4, 0], [0, 4])
    const b = new Segment([3, 1], [1, 3])
    const inters = [[1, 3], [3, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
  })

  test('collinear, no overlap', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([2, 2], [4, 4])
    expect(a.getIntersections(b)).toEqual([])
  })

  test('parallel', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0, -1], [1, 0])
    expect(a.getIntersections(b)).toEqual([])
  })

  test('parallel, orientation', () => {
    const a = new Segment([1, 1], [0, 0])
    const b = new Segment([0, -1], [1, 0])
    expect(a.getIntersections(b)).toEqual([])
  })

  test('parallel, position', () => {
    const a = new Segment([0, -1], [1, 0])
    const b = new Segment([0, 0], [1, 1])
    expect(a.getIntersections(b)).toEqual([])
  })
})

describe('is an endpoint', () => {
  const p1 = [0, -1]
  const p2 = [1, 0]
  const seg = new Segment(p1, p2)

  test('yup', () => {
    expect(seg.isAnEndpoint(p1)).toBeTruthy()
    expect(seg.isAnEndpoint(p2)).toBeTruthy()
  })

  test('nope', () => {
    expect(seg.isAnEndpoint([-34, 46])).toBeFalsy()
    expect(seg.isAnEndpoint([0, 0])).toBeFalsy()
  })
})
