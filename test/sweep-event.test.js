/* eslint-env jest */

import Segment from '../src/segment'
import SweepEvent from '../src/sweep-event'

describe('sweep event compare', () => {
  test('favor earlier x in point', () => {
    const s1 = new SweepEvent({ x: -5, y: 4 })
    const s2 = new SweepEvent({ x: 5, y: 1 })
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor earlier y in point', () => {
    const s1 = new SweepEvent({ x: 5, y: -4 })
    const s2 = new SweepEvent({ x: 5, y: 4 })
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor right events over left', () => {
    const seg1 = Segment.fromRing({ x: 5, y: 4 }, { x: 3, y: 2 })
    const seg2 = Segment.fromRing({ x: 5, y: 4 }, { x: 6, y: 5 })
    expect(SweepEvent.compare(seg1.rightSE, seg2.leftSE)).toBe(-1)
    expect(SweepEvent.compare(seg2.leftSE, seg1.rightSE)).toBe(1)
  })

  test('then favor non-vertical segments for left events', () => {
    const seg1 = Segment.fromRing({ x: 3, y: 2 }, { x: 3, y: 4 })
    const seg2 = Segment.fromRing({ x: 3, y: 2 }, { x: 5, y: 4 })
    expect(SweepEvent.compare(seg1.leftSE, seg2.rightSE)).toBe(-1)
    expect(SweepEvent.compare(seg2.rightSE, seg1.leftSE)).toBe(1)
  })

  test('then favor vertical segments for right events', () => {
    const seg1 = Segment.fromRing({ x: 3, y: 4 }, { x: 3, y: 2 })
    const seg2 = Segment.fromRing({ x: 3, y: 4 }, { x: 1, y: 2 })
    expect(SweepEvent.compare(seg1.leftSE, seg2.rightSE)).toBe(-1)
    expect(SweepEvent.compare(seg2.rightSE, seg1.leftSE)).toBe(1)
  })

  test('then favor lower segment', () => {
    const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
    const seg2 = Segment.fromRing({ x: 0, y: 0 }, { x: 5, y: 6 })
    expect(SweepEvent.compare(seg1.leftSE, seg2.rightSE)).toBe(-1)
    expect(SweepEvent.compare(seg2.rightSE, seg1.leftSE)).toBe(1)
  })

  // Sometimes from one segment's perspective it appears colinear
  // to another segment, but from that other segment's perspective
  // they aren't colinear. This happens because a longer segment
  // is able to better determine what is and is not colinear.
  test('and favor barely lower segment', () => {
    const seg1 = Segment.fromRing({ x: -75.725, y: 45.357 }, { x: -75.72484615384616, y: 45.35723076923077 })
    const seg2 = Segment.fromRing({ x: -75.725, y: 45.357 }, { x: -75.723, y: 45.36 })
    expect(SweepEvent.compare(seg1.leftSE, seg2.leftSE)).toBe(1)
    expect(SweepEvent.compare(seg2.leftSE, seg1.leftSE)).toBe(-1)
  })

  test('then favor lower ring id', () => {
    const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    const seg2 = Segment.fromRing({ x: 0, y: 0 }, { x: 5, y: 5 }, { id: 2 })
    expect(SweepEvent.compare(seg1.leftSE, seg2.leftSE)).toBe(-1)
    expect(SweepEvent.compare(seg2.leftSE, seg1.leftSE)).toBe(1)
  })

  test('identical equal', () => {
    const s1 = new SweepEvent({ x: 0, y: 0 })
    const s3 = new SweepEvent({ x: 3, y: 3 })
    new Segment(s1, s3, { id: 1 })
    new Segment(s1, s3, { id: 1 })
    expect(SweepEvent.compare(s1, s1)).toBe(0)
  })

  test('totally equal but not identical events are consistent', () => {
    const s1 = new SweepEvent({ x: 0, y: 0 })
    const s2 = new SweepEvent({ x: 0, y: 0 })
    const s3 = new SweepEvent({ x: 3, y: 3 })
    new Segment(s1, s3, { id: 1 })
    new Segment(s2, s3, { id: 1 })
    const result = SweepEvent.compare(s1, s2)
    expect(SweepEvent.compare(s1, s2)).toBe(result)
    expect(SweepEvent.compare(s2, s1)).toBe(result * -1)
  })

  test('events are linked as side effect', () => {
    const s1 = new SweepEvent({ x: 0, y: 0 })
    const s2 = new SweepEvent({ x: 0, y: 0 })
    new Segment(s1, new SweepEvent({ x: 2, y: 2 }))
    new Segment(s2, new SweepEvent({ x: 3, y: 4}))
    expect(s1.point !== s2.point)
    SweepEvent.compare(s1, s2)
    expect(s1.point === s2.point)
  })

  test('consistency edge case', () => {
    // harvested from https://github.com/mfogel/polygon-clipping/issues/62
    const seg1 = Segment.fromRing({ x: -71.0390933353125, y: 41.504475 }, { x: -71.0389879, y: 41.5037842 })
    const seg2 = Segment.fromRing({ x: -71.0390933353125, y: 41.504475 }, { x: -71.03906280974431, y: 41.504275 })
    expect(SweepEvent.compare(seg1.leftSE, seg2.leftSE)).toBe(-1)
    expect(SweepEvent.compare(seg2.leftSE, seg1.leftSE)).toBe(1)
  })
})

describe('constructor', () => {
  test('events created from same point are already linked', () => {
    const p1 = { x: 0, y: 0 }
    const s1 = new SweepEvent(p1)
    const s2 = new SweepEvent(p1)
    expect(s1.point === p1)
    expect(s1.point.events === s2.point.events)
  })
})

describe('sweep event link', () => {
  test('no linked events', () => {
    const s1 = new SweepEvent({ x: 0, y: 0 })
    expect(s1.point.events).toEqual([s1])
    expect(s1.getAvailableLinkedEvents()).toEqual([])
  })

  test('link events already linked with others', () => {
    const p1 = { x: 1, y: 2 }
    const p2 = { x: 1, y: 2 }
    const se1 = new SweepEvent(p1)
    const se2 = new SweepEvent(p1)
    const se3 = new SweepEvent(p2)
    const se4 = new SweepEvent(p2)
    new Segment(se1, new SweepEvent({ x: 5, y: 5 }))
    new Segment(se2, new SweepEvent({ x: 6, y: 6 }))
    new Segment(se3, new SweepEvent({ x: 7, y: 7 }))
    new Segment(se4, new SweepEvent({ x: 8, y: 8 }))
    se1.link(se3)
    expect(se1.point.events.length).toBe(4)
    expect(se1.point).toBe(se2.point)
    expect(se1.point).toBe(se3.point)
    expect(se1.point).toBe(se4.point)
  })

  test('same event twice', () => {
    const p1 = { x: 0, y: 0 }
    const s1 = new SweepEvent(p1)
    const s2 = new SweepEvent(p1)
    expect(() => s2.link(s1)).toThrow()
    expect(() => s1.link(s2)).toThrow()
  })

  test('unavailable linked events do not show up', () => {
    const p1 = { x: 0, y: 0}
    const se = new SweepEvent(p1)
    const seAlreadyProcessed = new SweepEvent(p1)
    const seNotInResult = new SweepEvent(p1)
    seAlreadyProcessed.segment = { isInResult: () => true, ringOut: {} }
    seNotInResult.segment = { isInResult: () => false, ringOut: null }
    expect(se.getAvailableLinkedEvents()).toEqual([])
  })

  test('available linked events show up', () => {
    const p1 = { x: 0, y: 0}
    const se = new SweepEvent(p1)
    const seOkay = new SweepEvent(p1)
    seOkay.segment = { isInResult: () => true, ringOut: null }
    expect(se.getAvailableLinkedEvents()).toEqual([seOkay])
  })

  test('link goes both ways', () => {
    const p1 = { x: 0, y: 0}
    const seOkay1 = new SweepEvent(p1)
    const seOkay2 = new SweepEvent(p1)
    seOkay1.segment = { isInResult: () => true, ringOut: null }
    seOkay2.segment = { isInResult: () => true, ringOut: null }
    expect(seOkay1.getAvailableLinkedEvents()).toEqual([seOkay2])
    expect(seOkay2.getAvailableLinkedEvents()).toEqual([seOkay1])
  })
})

describe('sweep event get leftmost comparator', () => {
  test('after a segment straight to the right', () => {
    const prevEvent = new SweepEvent({ x: 0, y: 0 })
    const event = new SweepEvent({ x: 1, y: 0 })
    const comparator = event.getLeftmostComparator(prevEvent)

    const e1 = new SweepEvent({ x: 1, y: 0 })
    new Segment(e1, new SweepEvent({ x: 0, y: 1 }))

    const e2 = new SweepEvent({ x: 1, y: 0 })
    new Segment(e2, new SweepEvent({ x: 1, y: 1 }))

    const e3 = new SweepEvent({ x: 1, y: 0 })
    new Segment(e3, new SweepEvent({ x: 2, y: 0 }))

    const e4 = new SweepEvent({ x: 1, y: 0 })
    new Segment(e4, new SweepEvent({ x: 1, y: -1 }))

    const e5 = new SweepEvent({ x: 1, y: 0 })
    new Segment(e5, new SweepEvent({ x: 0, y: -1 }))

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

    const e1 = new SweepEvent({ x: 0, y: 0 })
    new Segment(e1, new SweepEvent({ x: 0, y: 1 }))

    const e2 = new SweepEvent({ x: 0, y: 0 })
    new Segment(e2, new SweepEvent({ x: 1, y: 0 }))

    const e3 = new SweepEvent({ x: 0, y: 0 })
    new Segment(e3, new SweepEvent({ x: 0, y: -1 }))

    const e4 = new SweepEvent({ x: 0, y: 0 })
    new Segment(e4, new SweepEvent({ x: -1, y: 0 }))

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
