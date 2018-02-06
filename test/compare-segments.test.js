/* eslint-env jest */

const Tree = require('avl')
const compareSegments = require('../src/compare-segments')
const compareEvents = require('../src/compare-events')
const SweepEvent = require('../src/sweep-event')

describe('compare segments are not collinear', () => {
  test('shared left point - right point first', () => {
    const tree = new Tree(compareSegments)
    const pt = [0.0, 0.0]
    const se1 = SweepEvent.buildPair(pt, [1, 1])[0]
    const se2 = SweepEvent.buildPair(pt, [2, 3])[0]

    tree.insert(se1)
    tree.insert(se2)

    expect(tree.maxNode().key.otherEvent.point).toEqual([2, 3])
    expect(tree.minNode().key.otherEvent.point).toEqual([1, 1])
  })

  test('different left point - right point y coord to sort', () => {
    const tree = new Tree(compareSegments)
    const se1 = SweepEvent.buildPair([0, 1], [1, 1])[0]
    const se2 = SweepEvent.buildPair([0, 2], [2, 3])[0]

    tree.insert(se1)
    tree.insert(se2)

    expect(tree.minNode().key.otherEvent.point).toEqual([1, 1])
    expect(tree.maxNode().key.otherEvent.point).toEqual([2, 3])
  })

  test('events order in sweep line', () => {
    const se1 = SweepEvent.buildPair([0, 1], [2, 1])[0]
    const se2 = SweepEvent.buildPair([-1, 0], [2, 3])[0]

    const se3 = SweepEvent.buildPair([0, 1], [3, 4])[0]
    const se4 = SweepEvent.buildPair([-1, 0], [3, 1])[0]

    expect(compareEvents(se1, se2)).toBe(1)
    expect(se2.isBelow(se1.point)).toBeFalsy()
    expect(se2.isAbove(se1.point)).toBeTruthy()

    expect(compareSegments(se1, se2)).toBe(-1)
    expect(compareSegments(se2, se1)).toBe(1)

    expect(compareEvents(se3, se4)).toBe(1)
    expect(se4.isAbove(se3.point)).toBeFalsy()
  })

  test('first point is below', () => {
    const se1 = SweepEvent.buildPair([-1, 0], [2, 3])[0]
    const se2 = SweepEvent.buildPair([0, 1], [2, 1])[0]

    expect(se1.isBelow(se2.point)).toBeFalsy()
    expect(compareSegments(se1, se2)).toBe(1)
  })
})

describe('compare segments are collinear', () => {
  test('general', () => {
    const se1 = SweepEvent.buildPair([1, 1], [5, 1], true)[0]
    const se2 = SweepEvent.buildPair([2, 1], [3, 1], false)[0]

    expect(se1.isSubject).not.toBe(se2.isSubject)
    expect(compareSegments(se1, se2)).toBe(-1)
  })

  test('left point', () => {
    const pt = [0, 1]

    const se1 = SweepEvent.buildPair(pt, [5, 1])[0]
    const se2 = SweepEvent.buildPair(pt, [3, 1])[0]

    se1.contourId = 1
    se2.contourId = 2

    expect(se1.isSubject).toBe(se2.isSubject)
    expect(se1.point).toBe(se2.point)

    expect(compareSegments(se1, se2)).toBe(-1)

    se1.contourId = 2
    se2.contourId = 1

    expect(compareSegments(se1, se2)).toBe(1)
  })

  test('same polygon different left points', () => {
    const se1 = SweepEvent.buildPair([1, 1], [5, 1])[0]
    const se2 = SweepEvent.buildPair([2, 1], [3, 1])[0]

    expect(se1.isSubject).toBe(se2.isSubject)
    expect(se1.point).not.toEqual(se2.point)
    expect(compareSegments(se1, se2)).toBe(-1)
    expect(compareSegments(se2, se1)).toBe(1)
  })
})
