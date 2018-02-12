/* eslint-env jest */

const Segment = require('../src/segment')
const SweepEvent = require('../src/sweep-event')

describe('sweep event compare', () => {
  test('favor earlier x in point', () => {
    const s1 = new SweepEvent([-5, 4])
    const s2 = new SweepEvent([5, 1])
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor earlier y in point', () => {
    const s1 = new SweepEvent([5, -4])
    const s2 = new SweepEvent([5, 4])
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor right events over left', () => {
    const s1 = new Segment([3, 2], [5, 4]).rightSE
    const s2 = new Segment([5, 4], [6, 5]).leftSE
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor lower segment', () => {
    const s1 = new Segment([0, 0], [4, 4]).leftSE
    const s2 = new Segment([0, 0], [5, 6]).leftSE
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor subject', () => {
    const s1 = new Segment([0, 0], [5, 5], true).leftSE
    const s2 = new Segment([0, 0], [4, 4], false).leftSE
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor earlier created first', () => {
    const s1 = new Segment([0, 0], [5, 5], true).leftSE
    const s2 = new Segment([0, 0], [4, 4], true).leftSE
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('totally equal', () => {
    const s1 = new Segment([0, 0], [5, 5], true).leftSE
    expect(SweepEvent.compare(s1, s1)).toBe(0)
  })

  test('length does not matter', () => {
    const s1 = new Segment([0, 0], [5, 5], true).leftSE
    const s2 = new Segment([0, 0], [4, 4], true).leftSE
    const s3 = new Segment([0, 0], [5, 5], true).leftSE
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s3)).toBe(-1)
    expect(SweepEvent.compare(s1, s3)).toBe(-1)
  })
})

describe('sweep event compare points', () => {
  test('earlier X coord', () =>
    expect(SweepEvent.comparePoints([-1, 1], [0, 0])).toBe(-1))
  test('later X coord', () =>
    expect(SweepEvent.comparePoints([1, 0], [0, 1])).toBe(1))
  test('earlier Y coord', () =>
    expect(SweepEvent.comparePoints([0, -1], [0, 0])).toBe(-1))
  test('later Y coord', () =>
    expect(SweepEvent.comparePoints([0, 1], [0, 0])).toBe(1))
  test('equal coord', () =>
    expect(SweepEvent.comparePoints([1, 1], [1, 1])).toBe(0))
})
