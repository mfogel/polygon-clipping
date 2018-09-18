/* eslint-env jest */

import Segment from '../src/segment'
import SweepEvent from '../src/sweep-event'

describe('sweep event compare', () => {
  test('favor earlier x in point', () => {
    const s1 = SweepEvent.makeTwins({ x: -5, y: 4 })[0]
    const s2 = SweepEvent.makeTwins({ x: 5, y: 1 })[0]
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor earlier y in point', () => {
    const s1 = SweepEvent.makeTwins({ x: 5, y: -4 })[0]
    const s2 = SweepEvent.makeTwins({ x: 5, y: 4 })[0]
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor right events over left', () => {
    const [s1, s2] = SweepEvent.makeTwins({ x: 5, y: 4 })
    Segment.fromRing(s1, SweepEvent.makeTwins({ x: 3, y: 2 })[0])
    Segment.fromRing(s2, SweepEvent.makeTwins({ x: 6, y: 5 })[0])
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor non-vertical segments for left events', () => {
    const [s1, s2] = SweepEvent.makeTwins({ x: 3, y: 2 })
    Segment.fromRing(s1, SweepEvent.makeTwins({ x: 3, y: 4 })[0])
    Segment.fromRing(s2, SweepEvent.makeTwins({ x: 5, y: 4 })[0])
    expect(SweepEvent.compare(s1, s2)).toBe(1)
    expect(SweepEvent.compare(s2, s1)).toBe(-1)
  })

  test('then favor vertical segments for right events', () => {
    const [s1, s2] = SweepEvent.makeTwins({ x: 3, y: 4 })
    Segment.fromRing(s1, SweepEvent.makeTwins({ x: 3, y: 2 })[0])
    Segment.fromRing(s2, SweepEvent.makeTwins({ x: 1, y: 2 })[0])
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor lower segment', () => {
    const [s1, s2] = SweepEvent.makeTwins({ x: 0, y: 0 })
    Segment.fromRing(s1, SweepEvent.makeTwins({ x: 4, y: 4 })[0])
    Segment.fromRing(s2, SweepEvent.makeTwins({ x: 5, y: 6 })[0])
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('then favor lower ring id', () => {
    const [s1, s2] = SweepEvent.makeTwins({ x: 0, y: 0 })
    Segment.fromRing(s1, SweepEvent.makeTwins({ x: 4, y: 4 })[0], { id: 1 })
    Segment.fromRing(s2, SweepEvent.makeTwins({ x: 5, y: 5 })[0], { id: 2 })
    expect(SweepEvent.compare(s1, s2)).toBe(-1)
    expect(SweepEvent.compare(s2, s1)).toBe(1)
  })

  test('identical equal', () => {
    const s1 = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    const s3 = SweepEvent.makeTwins({ x: 4, y: 4 })[0]
    Segment.fromRing(s1, s3, { id: 1 })
    expect(SweepEvent.compare(s1, s1)).toBe(0)
  })

  test('totally equal but not identical', () => {
    const [s1, s2] = SweepEvent.makeTwins({ x: 0, y: 0 })
    const [s3, s4] = SweepEvent.makeTwins({ x: 1, y: 1 })
    Segment.fromRing(s1, s3, { id: 1 })
    Segment.fromRing(s2, s4, { id: 1 })
    expect(() => SweepEvent.compare(s1, s2)).toThrow()
  })

  test('length does not matter', () => {
    const [s1, s2] = SweepEvent.makeTwins({ x: 0, y: 0 })
    Segment.fromRing(s1, SweepEvent.makeTwins({ x: 4, y: 4 })[0], { id: 1 })
    Segment.fromRing(s2, SweepEvent.makeTwins({ x: 5, y: 5 })[0], { id: 1 })
    expect(() => SweepEvent.compare(s1, s2)).toThrow()
  })

  test('events are linked as side effect', () => {
    const [s1, s2] = SweepEvent.makeTwins({ x: 0, y: 0 })
    s1.linkedEvents = [s1]
    s2.linkedEvents = [s2]
    Segment.fromRing(s1, SweepEvent.makeTwins({ x: 4, y: 4 })[0])
    Segment.fromRing(s2, SweepEvent.makeTwins({ x: 5, y: 6 })[0])
    SweepEvent.compare(s1, s2)
    expect(s1.linkedEvents === s2.linkedEvents)
  })
})

describe('makeTwins()', () => {
  test('basic', () => {
    const pt = { x: 0, y: 0 }
    const twins = SweepEvent.makeTwins(pt)
    expect(twins[0].point).toBe(pt)
    expect(twins[1].point).toBe(pt)
    expect(twins[0].linkedEvents).toBe(twins[1].linkedEvents)
  })
})

describe('sweep event link', () => {
  test('no linked events', () => {
    const [se1, se2] = SweepEvent.makeTwins({ x: 0, y: 0 })
    se1.linkedEvents = [se1]
    se2.linkedEvents = [se2]
    expect(se1.getAvailableLinkedEvents()).toEqual([])
    expect(se2.getAvailableLinkedEvents()).toEqual([])
  })

  test('link events already linked with others', () => {
    const [se1, se2] = SweepEvent.makeTwins({ x: 1, y: 2 })
    const [se3, se4] = SweepEvent.makeTwins({ x: 1, y: 2 })
    Segment.fromRing(se1, SweepEvent.makeTwins({ x: 5, y: 5 })[0])
    Segment.fromRing(se2, SweepEvent.makeTwins({ x: 6, y: 6 })[0])
    Segment.fromRing(se3, SweepEvent.makeTwins({ x: 7, y: 7 })[0])
    Segment.fromRing(se4, SweepEvent.makeTwins({ x: 8, y: 8 })[0])
    se1.link(se3)
    expect(se1.linkedEvents.length).toBe(4)
    expect(se1.linkedEvents).toBe(se2.linkedEvents)
    expect(se1.linkedEvents).toBe(se3.linkedEvents)
    expect(se1.linkedEvents).toBe(se4.linkedEvents)
  })

  test('same event twice', () => {
    const [se1, se2] = SweepEvent.makeTwins({ x: 0, y: 0 })
    expect(() => se2.link(se1)).toThrow()
    expect(() => se1.link(se2)).toThrow()
  })

  test('unavailable linked events do not show up', () => {
    const se = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    const [seAlreadyProcessed, seNotInResult] = SweepEvent.makeTwins({ x: 0, y: 0 })
    se.linkedEvents = [se, seAlreadyProcessed, seNotInResult]

    seAlreadyProcessed.segment = { isInResult: true, ringOut: {} }
    seNotInResult.segment = { isInResult: false, ringOut: null }

    expect(se.getAvailableLinkedEvents()).toEqual([])
  })

  test('available linked events show up', () => {
    const se = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    const [seOkay1, seOkay2] = SweepEvent.makeTwins({ x: 0, y: 0 })
    se.linkedEvents = [se, seOkay1, seOkay2]

    seOkay1.segment = { isInResult: true, ringOut: null }
    seOkay2.segment = { isInResult: true, ringOut: null }

    expect(se.getAvailableLinkedEvents()).toEqual([seOkay1, seOkay2])
  })

  test('link goes both ways', () => {
    const [seOkay1, seOkay2] = SweepEvent.makeTwins({ x: 0, y: 0 })
    seOkay1.segment = { isInResult: true, ringOut: null }
    seOkay2.segment = { isInResult: true, ringOut: null }
    expect(seOkay1.getAvailableLinkedEvents()).toEqual([seOkay2])
    expect(seOkay2.getAvailableLinkedEvents()).toEqual([seOkay1])
  })
})

describe('sweep event get leftmost comparator', () => {
  test('after a segment straight to the right', () => {
    const prevEvent = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    const event = SweepEvent.makeTwins({ x: 1, y: 0 })[0]
    const comparator = event.getLeftmostComparator(prevEvent)

    const e1 = SweepEvent.makeTwins({ x: 1, y: 0 })[0]
    Segment.fromRing(e1, SweepEvent.makeTwins({ x: 0, y: 1 })[0])

    const e2 = SweepEvent.makeTwins({ x: 1, y: 0 })[0]
    Segment.fromRing(e2, SweepEvent.makeTwins({ x: 1, y: 1 })[0])

    const e3 = SweepEvent.makeTwins({ x: 1, y: 0 })[0]
    Segment.fromRing(e3, SweepEvent.makeTwins({ x: 2, y: 0 })[0])

    const e4 = SweepEvent.makeTwins({ x: 1, y: 0 })[0]
    Segment.fromRing(e4, SweepEvent.makeTwins({ x: 1, y: -1 })[0])

    const e5 = SweepEvent.makeTwins({ x: 1, y: 0 })[0]
    Segment.fromRing(e5, SweepEvent.makeTwins({ x: 0, y: -1 })[0])

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
    const prevEvent = SweepEvent.makeTwins({ x: 1, y: 1 })[0]
    const event = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    const comparator = event.getLeftmostComparator(prevEvent)

    const e1 = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    Segment.fromRing(e1, SweepEvent.makeTwins({ x: 0, y: 1 })[0])

    const e2 = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    Segment.fromRing(e2, SweepEvent.makeTwins({ x: 1, y: 0 })[0])

    const e3 = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    Segment.fromRing(e3, SweepEvent.makeTwins({ x: 0, y: -1 })[0])

    const e4 = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    Segment.fromRing(e4, SweepEvent.makeTwins({ x: -1, y: 0 })[0])

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

describe('isOrientationCorrect()', () => {
  test('yes', () => {
    const seg = Segment.fromRing(
      SweepEvent.makeTwins({ x: 0, y: 0 })[0],
      SweepEvent.makeTwins({ x: 1, y: 1 })[0],
    )
    expect(seg.leftSE.isOrientationCorrect).toBe(true)
    expect(seg.rightSE.isOrientationCorrect).toBe(true)
  })

  test('no', () => {
    const seg = Segment.fromRing(
      SweepEvent.makeTwins({ x: 0, y: 0 })[0],
      SweepEvent.makeTwins({ x: 1, y: 1 })[0],
    )
    seg.leftSE.point.x = 42
    expect(seg.leftSE.isOrientationCorrect).toBe(false)
    expect(seg.rightSE.isOrientationCorrect).toBe(false)
  })

  test('degenerate segment', () => {
    const seg = Segment.fromRing(
      SweepEvent.makeTwins({ x: 0, y: 0 })[0],
      SweepEvent.makeTwins({ x: 1, y: 1 })[0],
    )
    seg.leftSE.point.x = 1
    seg.leftSE.point.y = 1
    expect(() => seg.leftSE.isOrientationCorrect).toThrow()
    expect(() => seg.rightSE.isOrientationCorrect).toThrow()
  })
})
