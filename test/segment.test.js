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
