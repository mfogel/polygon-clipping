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

describe('sweep event link', () => {
  test('no linked events', () => {
    const se = new SweepEvent()
    expect(se.availableLinkedEvents).toEqual([])
  })

  test('cannot link already linked event', () => {
    const se1 = new SweepEvent()
    const se2 = new SweepEvent()
    const se3 = new SweepEvent()

    se2.link(se3)
    expect(() => se1.link(se3)).toThrow()
  })

  test('unavailable linked events do not show up', () => {
    const se = new SweepEvent()
    const seAlreadyProcessed = new SweepEvent()
    seAlreadyProcessed.segment = { isInResult: true, ring: {} }
    const seNotInResult = new SweepEvent()
    seNotInResult.segment = { isInResult: false, ring: null }

    se.link(seAlreadyProcessed)
    se.link(seNotInResult)
    expect(se.availableLinkedEvents).toEqual([])
  })

  test('available linked events show up', () => {
    const se = new SweepEvent()
    const seOkay1 = new SweepEvent([0, 0])
    seOkay1.segment = { isInResult: true, ring: null }
    const seOkay2 = new SweepEvent([1, 0])
    seOkay2.segment = { isInResult: true, ring: null }

    se.link(seOkay1)
    se.link(seOkay2)
    expect(se.availableLinkedEvents).toEqual([seOkay1, seOkay2])
  })

  test('link goes both ways', () => {
    const seOkay1 = new SweepEvent([0, 0])
    seOkay1.segment = { isInResult: true, ring: null }
    const seOkay2 = new SweepEvent([1, 0])
    seOkay2.segment = { isInResult: true, ring: null }

    seOkay1.link(seOkay2)
    expect(seOkay1.availableLinkedEvents).toEqual([seOkay2])
    expect(seOkay2.availableLinkedEvents).toEqual([seOkay1])
  })
})

describe('sweep event get leftmost comparator', () => {
  test('after a segment straight to the right', () => {
    const prevEvent = new SweepEvent([0, 0])
    const event = new SweepEvent([1, 0])
    const comparator = event.getLeftmostComparator(prevEvent)

    const e1 = new Segment([1, 0], [0, 1]).rightSE
    const e2 = new Segment([1, 0], [1, 1]).leftSE
    const e3 = new Segment([1, 0], [2, 0]).leftSE
    const e4 = new Segment([1, 0], [1, -1]).rightSE
    const e5 = new Segment([1, 0], [0, -1]).rightSE

    expect(comparator(e1, e2)).toBe(-1)
    expect(comparator(e2, e3)).toBe(-1)
    expect(comparator(e3, e4)).toBe(-1)
    expect(comparator(e4, e5)).toBe(-1)

    expect(comparator(e2, e1)).toBe(1)
    expect(comparator(e3, e2)).toBe(1)
    expect(comparator(e4, e3)).toBe(1)
    expect(comparator(e5, e4)).toBe(1)

    expect(comparator(e1, e3)).toBe(-1)
    expect(comparator(e1, e4)).toBe(-1)
    expect(comparator(e1, e5)).toBe(-1)

    expect(comparator(e1, e1)).toBe(0)
  })

  test('after a down and to the left', () => {
    const prevEvent = new SweepEvent([1, 1])
    const event = new SweepEvent([0, 0])
    const comparator = event.getLeftmostComparator(prevEvent)

    const e1 = new Segment([0, 0], [0, 1]).leftSE
    const e2 = new Segment([0, 0], [1, 0]).leftSE
    const e3 = new Segment([0, 0], [0, -1]).rightSE
    const e4 = new Segment([0, 0], [-1, 0]).rightSE

    expect(comparator(e1, e2)).toBe(1)
    expect(comparator(e1, e3)).toBe(1)
    expect(comparator(e1, e4)).toBe(1)

    expect(comparator(e2, e1)).toBe(-1)
    expect(comparator(e2, e3)).toBe(-1)
    expect(comparator(e2, e4)).toBe(-1)

    expect(comparator(e3, e1)).toBe(-1)
    expect(comparator(e3, e2)).toBe(1)
    expect(comparator(e3, e4)).toBe(-1)

    expect(comparator(e4, e1)).toBe(-1)
    expect(comparator(e4, e2)).toBe(1)
    expect(comparator(e4, e3)).toBe(1)
  })
})
