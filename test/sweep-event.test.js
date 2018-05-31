/* eslint-env jest */

import Segment from '../src/segment'
import SweepEvent from '../src/sweep-event'

describe('sweep event compareBefore', () => {
  test('favor earlier x in point', () => {
    const s1 = new SweepEvent({ x: -5, y: 4 })
    const s2 = new SweepEvent({ x: 5, y: 1 })
    expect(SweepEvent.compareBefore(s1, s2)).toBe(true)
    expect(SweepEvent.compareBefore(s2, s1)).toBe(false)
  })

  test('then favor earlier y in point', () => {
    const s1 = new SweepEvent({ x: 5, y: -4 })
    const s2 = new SweepEvent({ x: 5, y: 4 })
    expect(SweepEvent.compareBefore(s1, s2)).toBe(true)
    expect(SweepEvent.compareBefore(s2, s1)).toBe(false)
  })

  test('then favor right events over left', () => {
    const s1 = new Segment({ x: 3, y: 2 }, { x: 5, y: 4 }).rightSE
    const s2 = new Segment({ x: 5, y: 4 }, { x: 6, y: 5 }).leftSE
    expect(SweepEvent.compareBefore(s1, s2)).toBe(true)
    expect(SweepEvent.compareBefore(s2, s1)).toBe(false)
  })

  test('then favor lower segment', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 }).leftSE
    const s2 = new Segment({ x: 0, y: 0 }, { x: 5, y: 6 }).leftSE
    expect(SweepEvent.compareBefore(s1, s2)).toBe(true)
    expect(SweepEvent.compareBefore(s2, s1)).toBe(false)
  })

  test('then favor lower ring id', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 }, { id: 1 }).leftSE
    const s2 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 2 }).leftSE
    expect(SweepEvent.compareBefore(s1, s2)).toBe(true)
    expect(SweepEvent.compareBefore(s2, s1)).toBe(false)
  })

  test('identical equal', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 }, { id: 1 }).leftSE
    expect(SweepEvent.compareBefore(s1, s1)).toBe(false)
  })

  test('totally equal but not identical', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 }, { id: 1 }).leftSE
    const s2 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 }, { id: 1 }).leftSE
    expect(() => SweepEvent.compareBefore(s1, s2)).toThrow()
  })

  test('length does not matter', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 }, { id: 1 }).leftSE
    const s2 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 }).leftSE
    expect(() => SweepEvent.compareBefore(s1, s2)).toThrow()
  })
})

describe('sweep event link', () => {
  test('no linked events', () => {
    const se1 = new SweepEvent()
    const se2 = new SweepEvent()
    expect(se1.getAvailableLinkedEvents()).toEqual([])
    expect(se2.getAvailableLinkedEvents()).toEqual([])
  })

  test('link already linked event', () => {
    const se1 = new SweepEvent()
    const se2 = new SweepEvent()
    const se3 = new SweepEvent()
    const se4 = new SweepEvent()

    se2.link(se1)
    se4.link(se3)
    se3.link(se2)

    expect(se1.linkedEvents.length).toBe(4)
    expect(se1.linkedEvents).toBe(se2.linkedEvents)
    expect(se1.linkedEvents).toBe(se3.linkedEvents)
    expect(se1.linkedEvents).toBe(se4.linkedEvents)
  })

  test('unavailable linked events do not show up', () => {
    const se = new SweepEvent()
    const seAlreadyProcessed = new SweepEvent()
    seAlreadyProcessed.segment = { isInResult: true, ringOut: {} }
    const seNotInResult = new SweepEvent()
    seNotInResult.segment = { isInResult: false, ringOut: null }

    se.link(seAlreadyProcessed)
    se.link(seNotInResult)
    expect(se.getAvailableLinkedEvents()).toEqual([])
  })

  test('available linked events show up', () => {
    const se = new SweepEvent()
    const seOkay1 = new SweepEvent({ x: 0, y: 0 })
    seOkay1.segment = { isInResult: true, ringOut: null }
    const seOkay2 = new SweepEvent({ x: 1, y: 0 })
    seOkay2.segment = { isInResult: true, ringOut: null }

    se.link(seOkay1)
    se.link(seOkay2)
    expect(se.getAvailableLinkedEvents()).toEqual([seOkay1, seOkay2])
  })

  test('link goes both ways', () => {
    const seOkay1 = new SweepEvent({ x: 0, y: 0 })
    seOkay1.segment = { isInResult: true, ringOut: null }
    const seOkay2 = new SweepEvent({ x: 1, y: 0 })
    seOkay2.segment = { isInResult: true, ringOut: null }

    seOkay1.link(seOkay2)
    expect(seOkay1.getAvailableLinkedEvents()).toEqual([seOkay2])
    expect(seOkay2.getAvailableLinkedEvents()).toEqual([seOkay1])
  })
})

describe('sweep event get leftmost comparator', () => {
  test('after a segment straight to the right', () => {
    const prevEvent = new SweepEvent({ x: 0, y: 0 })
    const event = new SweepEvent({ x: 1, y: 0 })
    const comparator = event.getLeftmostComparator(prevEvent)

    const e1 = new Segment({ x: 1, y: 0 }, { x: 0, y: 1 }).rightSE
    const e2 = new Segment({ x: 1, y: 0 }, { x: 1, y: 1 }).leftSE
    const e3 = new Segment({ x: 1, y: 0 }, { x: 2, y: 0 }).leftSE
    const e4 = new Segment({ x: 1, y: 0 }, { x: 1, y: -1 }).rightSE
    const e5 = new Segment({ x: 1, y: 0 }, { x: 0, y: -1 }).rightSE

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
    const prevEvent = new SweepEvent({ x: 1, y: 1 })
    const event = new SweepEvent({ x: 0, y: 0 })
    const comparator = event.getLeftmostComparator(prevEvent)

    const e1 = new Segment({ x: 0, y: 0 }, { x: 0, y: 1 }).leftSE
    const e2 = new Segment({ x: 0, y: 0 }, { x: 1, y: 0 }).leftSE
    const e3 = new Segment({ x: 0, y: 0 }, { x: 0, y: -1 }).rightSE
    const e4 = new Segment({ x: 0, y: 0 }, { x: -1, y: 0 }).rightSE

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
