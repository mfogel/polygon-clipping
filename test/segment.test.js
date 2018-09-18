/* eslint-env jest */

import Segment from '../src/segment'
import SweepEvent from '../src/sweep-event'

function buildSegment(pt1, pt2, ring) {
  const seg = Segment.fromRing(
    SweepEvent.makeTwins(pt1)[0],
    SweepEvent.makeTwins(pt2)[0],
    ring,
  )
  seg.leftSE.linkedEvents = [seg.leftSE]
  seg.rightSE.linkedEvents = [seg.rightSE]
  return seg
}

describe('constructor', () => {
  test('general', () => {
    const ringIn = {}
    const seg = new Segment(ringIn)
    expect(seg.ringIn).toEqual(ringIn)
    expect(seg.leftSE).toBeNull()
    expect(seg.rightSE).toBeNull()
    expect(seg.ringOut).toBeNull()
    expect(seg._cache).toEqual({})
  })
})

describe('fromRing', () => {
  test('correct point on left and right 1', () => {
    const s1 = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    const s2 = SweepEvent.makeTwins({ x: 0, y: 1 })[0]
    const seg = Segment.fromRing(s1, s2)
    expect(seg.leftSE).toEqual(s1)
    expect(seg.rightSE).toEqual(s2)
  })

  test('correct point on left and right 1', () => {
    const s1 = SweepEvent.makeTwins({ x: 0, y: 0 })[0]
    const s2 = SweepEvent.makeTwins({ x: -1, y: 0 })[0]
    const seg = Segment.fromRing(s1, s2)
    expect(seg.leftSE).toEqual(s2)
    expect(seg.rightSE).toEqual(s1)
  })

  test('attempt create segment with same poitns', () => {
    const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t2 = SweepEvent.makeTwins({ x: 0, y: 0 })
    expect(() => Segment.fromRing(t1[0], t2[0])).toThrow()
  })
})

describe('split', () => {
  test('on interior point', () => {
    const seg = buildSegment({ x: 0, y: 0 }, { x: 10, y: 10 }, true)
    const pt = { x: 5, y: 5 }
    const evts = seg.split([pt])
    expect(evts[0].segment).toBe(seg)
    expect(evts[0].point).toEqual(pt)
    expect(evts[0].isRight).toBeTruthy()
    expect(evts[1].segment).not.toBe(seg)
    expect(evts[1].point).toEqual(pt)
    expect(evts[1].isLeft).toBeTruthy()
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment)
  })

  test('on close-to-but-not-exactly interior point', () => {
    const seg = buildSegment({ x: 0, y: 10 }, { x: 10, y: 0 }, false)
    const pt = { x: 5 + Number.EPSILON, y: 5 }
    const evts = seg.split([pt])
    expect(evts[0].segment).toBe(seg)
    expect(evts[0].point).toEqual(pt)
    expect(evts[0].isRight).toBeTruthy()
    expect(evts[1].segment).not.toBe(seg)
    expect(evts[1].point).toEqual(pt)
    expect(evts[1].isLeft).toBeTruthy()
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment)
  })

  test('on endpoint - should throw error', () => {
    const seg = buildSegment({ x: 0, y: 0 }, { x: 10, y: 10 }, true)
    expect(() => seg.split([{ x: 0, y: 0 }])).toThrow()
    expect(() => seg.split([{ x: 10, y: 10 }])).toThrow()
  })

  test('on three interior points', () => {
    const seg = buildSegment({ x: 0, y: 0 }, { x: 10, y: 10 }, true)
    const [sPt1, sPt2, sPt3] = [{ x: 2, y: 2 }, { x: 4, y: 4 }, { x: 6, y: 6 }]

    const [orgLeftEvt, orgRightEvt] = [seg.leftSE, seg.rightSE]
    const newEvts = seg.split([sPt3, sPt1, sPt2])

    expect(newEvts.length).toBe(6)

    expect(seg.leftSE).toBe(orgLeftEvt)
    let evt = newEvts.find(e => e.point === sPt1 && e.isRight)
    expect(seg.rightSE).toBe(evt)

    evt = newEvts.find(e => e.point === sPt1 && e.isLeft)
    let otherEvt = newEvts.find(e => e.point === sPt2 && e.isRight)
    expect(evt.segment).toBe(otherEvt.segment)

    evt = newEvts.find(e => e.point === sPt2 && e.isLeft)
    otherEvt = newEvts.find(e => e.point === sPt3 && e.isRight)
    expect(evt.segment).toBe(otherEvt.segment)

    evt = newEvts.find(e => e.point === sPt3 && e.isLeft)
    expect(evt.segment).toBe(orgRightEvt.segment)
  })

  test('coincidents stay coincident', () => {
    const seg1 = buildSegment({ x: 0, y: 0 }, { x: 10, y: 10 }, 0)
    const seg2 = buildSegment({ x: 0, y: 0 }, { x: 10, y: 10 }, 1)
    seg1.leftSE.link(seg2.leftSE)
    seg1.rightSE.link(seg2.rightSE)
    expect(seg1.coincidents).toBe(seg2.coincidents)
    const newEvents = seg1.split([{x: 5, y: 5}])
    expect(seg1.coincidents).toBe(seg2.coincidents)
    expect(newEvents.length).toBe(4)
    newEvents.forEach(evt => expect(evt.segment.coincidents.length).toBe(2))
  })
})

describe('simple properties - bbox, vector, points, isVertical', () => {
  test('general', () => {
    const seg = buildSegment({ x: 1, y: 2 }, { x: 3, y: 4 })
    expect(seg.bbox).toEqual({ ll: { x: 1, y: 2 }, ur: { x: 3, y: 4 } })
    expect(seg.vector).toEqual({ x: 2, y: 2 })
    expect(seg.isVertical).toBeFalsy()
  })

  test('horizontal', () => {
    const seg = buildSegment({ x: 1, y: 4 }, { x: 3, y: 4 })
    expect(seg.bbox).toEqual({ ll: { x: 1, y: 4 }, ur: { x: 3, y: 4 } })
    expect(seg.vector).toEqual({ x: 2, y: 0 })
    expect(seg.isVertical).toBeFalsy()
  })

  test('vertical', () => {
    const seg = buildSegment({ x: 3, y: 2 }, { x: 3, y: 4 })
    expect(seg.bbox).toEqual({ ll: { x: 3, y: 2 }, ur: { x: 3, y: 4 } })
    expect(seg.vector).toEqual({ x: 0, y: 2 })
    expect(seg.isVertical).toBeTruthy()
  })
})

describe('segment getOtherSE', () => {
  test('left to right', () => {
    const seg = buildSegment({ x: 0, y: 0 }, { x: 1, y: 0 }, true)
    expect(seg.getOtherSE(seg.leftSE)).toBe(seg.rightSE)
    expect(seg.leftSE.otherSE).toBe(seg.rightSE)
  })

  test('right to left', () => {
    const seg = buildSegment({ x: 0, y: 0 }, { x: 1, y: 0 }, true)
    expect(seg.getOtherSE(seg.rightSE)).toBe(seg.leftSE)
    expect(seg.rightSE.otherSE).toBe(seg.leftSE)
  })

  test('doesnt work for Sweep Events that are from other Segments', () => {
    const seg1 = buildSegment({ x: 0, y: 0}, { x: 1, y: 0 }, true)
    const seg2 = buildSegment({ x: 0, y: 0}, { x: 1, y: 0 }, true)
    expect(() => seg1.getOtherSE(seg2.leftSE)).toThrow()
  })
})

describe('segment register ring', () => {
  test('unregistered at first', () => {
    const seg = buildSegment({ x: 0, y: 0 }, { x: 1, y: 0 })
    expect(seg.ringOut).toBeNull()
  })

  test('register it', () => {
    const seg = buildSegment({ x: 0, y: 0 }, { x: 1, y: 0 })
    const ring = {}
    seg.registerRingOut(ring)
    expect(seg.ringOut).toBe(ring)
  })
})

describe('registerCoincident', () => {
  test('basic case', () => {
    const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t2 = SweepEvent.makeTwins({ x: 1, y: 0 })
    const seg1 = Segment.fromRing(t1[0], t2[0], {id: 1})
    const seg2 = Segment.fromRing(t1[1], t2[1], {id: 2})
    seg1.registerCoincident(seg2)
    expect(seg1.coincidents === seg2.coincidents)
  })

  test('coincidents cascade', () => {
    const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t2 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t3 = SweepEvent.makeTwins({ x: 1, y: 0 })
    const t4 = SweepEvent.makeTwins({ x: 1, y: 0 })
    const seg1 = Segment.fromRing(t1[0], t3[0], {id: 1})
    const seg2 = Segment.fromRing(t1[1], t3[1], {id: 2})
    const seg3 = Segment.fromRing(t2[0], t4[0], {id: 3})
    const seg4 = Segment.fromRing(t2[1], t4[1], {id: 4})
    seg1.registerCoincident(seg2)
    seg3.registerCoincident(seg4)
    seg2.registerCoincident(seg3)
    expect(seg1.coincidents === seg4.coincidents)
  })

  test('winner at the front of coincidents', () => {
    const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t2 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t3 = SweepEvent.makeTwins({ x: 1, y: 0 })
    const t4 = SweepEvent.makeTwins({ x: 1, y: 0 })
    const seg1 = Segment.fromRing(t1[0], t3[0], {id: 1})
    const seg2 = Segment.fromRing(t1[1], t3[1], {id: 2})
    const seg3 = Segment.fromRing(t2[0], t4[0], {id: 3})
    const seg4 = Segment.fromRing(t2[1], t4[1], {id: 4})
    seg1.registerCoincident(seg2)
    seg2.registerCoincident(seg3)
    seg3.registerCoincident(seg4)
    expect(seg4.coincidents[0] === seg1)
  })
})

describe('is an endpoint', () => {
  const s1 = SweepEvent.makeTwins({ x: 0, y: -1 })[0]
  const s2 = SweepEvent.makeTwins({ x: 1, y: 0 })[0]
  const seg = Segment.fromRing(s1, s2)

  test('yup', () => {
    expect(seg.isAnEndpoint(s1.point)).toBeTruthy()
    expect(seg.isAnEndpoint(s2.point)).toBeTruthy()
  })

  test('nope', () => {
    expect(seg.isAnEndpoint({ x: -34, y: 46 })).toBeFalsy()
    expect(seg.isAnEndpoint({ x: 0, y: 0 })).toBeFalsy()
  })
})

describe('is Point On', () => {
  const s1 = SweepEvent.makeTwins({ x: -1, y: -1 })[0]
  const s2 = SweepEvent.makeTwins({ x: 1, y: 1 })[0]
  const seg = Segment.fromRing(s1, s2)

  test('yup', () => {
    expect(seg.isPointOn(s1.point)).toBeTruthy()
    expect(seg.isPointOn(s2.point)).toBeTruthy()
    expect(seg.isPointOn({ x: 0, y: 0 })).toBeTruthy()
    expect(seg.isPointOn({ x: 0.5, y: 0.5 })).toBeTruthy()
  })

  test('nope', () => {
    expect(seg.isPointOn({ x: -234, y: 23421 })).toBeFalsy()
  })

  test('nope really close', () => {
    expect(seg.isPointOn({ x: 0, y: Number.EPSILON })).toBeFalsy()
  })
})

describe('comparison with point', () => {
  test('general', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = buildSegment({ x: 0, y: 1 }, { x: 0, y: 0 })

    expect(s1.comparePoint({ x: 0, y: 1 })).toBe(1)
    expect(s1.comparePoint({ x: 1, y: 2 })).toBe(1)
    expect(s1.comparePoint({ x: 0, y: 0 })).toBe(0)
    expect(s1.comparePoint({ x: 5, y: -1 })).toBe(-1)

    expect(s2.comparePoint({ x: 0, y: 1 })).toBe(0)
    expect(s2.comparePoint({ x: 1, y: 2 })).toBe(-1)
    expect(s2.comparePoint({ x: 0, y: 0 })).toBe(0)
    expect(s2.comparePoint({ x: 5, y: -1 })).toBe(-1)
  })

  test('barely above', () => {
    const s1 = buildSegment({ x: 1, y: 1 }, { x: 3, y: 1 })
    const pt = { x: 2, y: 1 - Number.EPSILON }
    expect(s1.comparePoint(pt)).toBe(-1)
  })

  test('barely below', () => {
    const s1 = buildSegment({ x: 1, y: 1 }, { x: 3, y: 1 })
    const pt = { x: 2, y: 1 + Number.EPSILON * 3 / 2 }
    expect(s1.comparePoint(pt)).toBe(1)
  })
})

/**
 * These tests ensures that these two methods produce consistent results.
 *
 * Deciding whether a point is on an infinitely thin line is a tricky question
 * in a floating point world. Previously, these two methods were coming to
 * different conclusions for the these points.
 */
describe('consistency between isPointOn() and getIntersections()', () => {
  test('t-intersection on endpoint', () => {
    const pt = {x: -104.0626, y: 75.4279525872937}
    const s1 = buildSegment({x: -104.117212, y: 75.4383502}, {x: -104.0624, y: 75.4279145091691})
    const s2 = buildSegment(pt, {x: -104.0625, y: 75.44})

    const inters1 = s1.getIntersections(s2)
    expect(inters1.length).toBe(1)
    expect(inters1[0].x).toBe(pt.x)
    expect(inters1[0].y).toBe(pt.y)

    const inters2 = s2.getIntersections(s1)
    expect(inters2.length).toBe(1)
    expect(inters2[0].x).toBe(pt.x)
    expect(inters2[0].y).toBe(pt.y)

    expect(s1.isPointOn(pt)).toBe(true)
    expect(s2.isPointOn(pt)).toBe(true)
  })

  test('two intersections on endpoints, overlapping parrallel segments', () => {
    const pt1 = {x: -104.0624, y: 75.4279145091691}
    const pt2 = {x: -104.0626, y: 75.4279525872937}
    const s1 = buildSegment({x: -104.117212, y: 75.4383502}, pt1)
    const s2 = buildSegment(pt2, {x: -104.0529352, y: 75.4261125})

    const inters1 = s1.getIntersections(s2)
    expect(inters1.length).toBe(2)
    expect(inters1[0].x).toBe(pt2.x)
    expect(inters1[0].y).toBe(pt2.y)
    expect(inters1[1].x).toBe(pt1.x)
    expect(inters1[1].y).toBe(pt1.y)

    const inters2 = s2.getIntersections(s1)
    expect(inters2.length).toBe(2)
    expect(inters2[0].x).toBe(pt2.x)
    expect(inters2[0].y).toBe(pt2.y)
    expect(inters2[1].x).toBe(pt1.x)
    expect(inters2[1].y).toBe(pt1.y)

    expect(s1.isPointOn(pt1)).toBe(true)
    expect(s1.isPointOn(pt2)).toBe(true)

    expect(s2.isPointOn(pt1)).toBe(true)
    expect(s2.isPointOn(pt2)).toBe(true)
  })
})

describe('get intersections 2', () => {
  test('colinear full overlap', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const inters = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap upward slope', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 2, y: 2 })
    const s2 = buildSegment({ x: 1, y: 1 }, { x: 3, y: 3 })
    const inters = [{ x: 1, y: 1 }, { x: 2, y: 2 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap downward slope', () => {
    const s1 = buildSegment({ x: 0, y: 2 }, { x: 2, y: 0 })
    const s2 = buildSegment({ x: -1, y: 3 }, { x: 1, y: 1 })
    const inters = [{ x: 0, y: 2 }, { x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap horizontal', () => {
    const s1 = buildSegment({ x: 0, y: 1 }, { x: 2, y: 1 })
    const s2 = buildSegment({ x: 1, y: 1 }, { x: 3, y: 1 })
    const inters = [{ x: 1, y: 1 }, { x: 2, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap vertical', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 0, y: 3 })
    const s2 = buildSegment({ x: 0, y: 2 }, { x: 0, y: 4 })
    const inters = [{ x: 0, y: 2 }, { x: 0, y: 3 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear endpoint overlap', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = buildSegment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const inters = [{ x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear no overlap', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = buildSegment({ x: 3, y: 3 }, { x: 4, y: 4 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('parallel no overlap', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = buildSegment({ x: 0, y: 3 }, { x: 1, y: 4 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('intersect general', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 2, y: 2 })
    const s2 = buildSegment({ x: 0, y: 2 }, { x: 2, y: 0 })
    const inters = [{ x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('T-intersect with an endpoint', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 2, y: 2 })
    const s2 = buildSegment({ x: 1, y: 1 }, { x: 5, y: 4 })
    const inters = [{ x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('intersect with vertical', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 5, y: 5 })
    const s2 = buildSegment({ x: 3, y: 0 }, { x: 3, y: 44 })
    const inters = [{ x: 3, y: 3 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('intersect with horizontal', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 5, y: 5 })
    const s2 = buildSegment({ x: 0, y: 3 }, { x: 23, y: 3 })
    const inters = [{ x: 3, y: 3 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('horizontal and vertical T-intersection', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 5, y: 0 })
    const s2 = buildSegment({ x: 3, y: 0 }, { x: 3, y: 5 })
    const inters = [{ x: 3, y: 0 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('horizontal and vertical general intersection', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 5, y: 0 })
    const s2 = buildSegment({ x: 3, y: -5 }, { x: 3, y: 5 })
    const inters = [{ x: 3, y: 0 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('no intersection not even close', () => {
    const s1 = buildSegment({ x: 1000, y: 10002 }, { x: 2000, y: 20002 })
    const s2 = buildSegment({ x: -234, y: -123 }, { x: -12, y: -23 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('no intersection kinda close', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
    const s2 = buildSegment({ x: 0, y: 10 }, { x: 10, y: 0 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('no intersection with vertical touching bbox', () => {
    const s1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
    const s2 = buildSegment({ x: 2, y: -5 }, { x: 2, y: 0 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('shared point 1', () => {
    const a = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = buildSegment({ x: 0, y: 1 }, { x: 0, y: 0 })
    const inters = [{ x: 0, y: 0 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('shared point 2', () => {
    const a = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = buildSegment({x: 0, y: 1 }, { x: 1, y: 1 })
    const inters = [{ x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('T-crossing', () => {
    const a = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = buildSegment({ x: 0.5, y: 0.5 }, { x: 1, y: 0 })
    const inters = [{ x: 0.5, y: 0.5 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = buildSegment({ x: 0, y: 0 }, { x: 10, y: 10 })
    const b = buildSegment({ x: 1, y: 1 }, { x: 5, y: 5 })
    const inters = [{ x: 1, y: 1 }, { x: 5, y: 5 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('shared point + overlap', () => {
    const a = buildSegment({ x: 1, y: 1 }, { x: 10, y: 10 })
    const b = buildSegment({ x: 1, y: 1 }, { x: 5, y: 5 })
    const inters = [{ x: 1, y: 1 }, { x: 5, y: 5 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('mutual overlap', () => {
    const a = buildSegment({ x: 3, y: 3 }, { x: 10, y: 10 })
    const b = buildSegment({ x: 0, y: 0 }, { x: 5, y: 5 })
    const inters = [{ x: 3, y: 3 }, { x: 5, y: 5 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const inters = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('full overlap, orientation', () => {
    const a = buildSegment({ x: 1, y: 1 }, { x: 0, y: 0 })
    const b = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const inters = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, shared point', () => {
    const a = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = buildSegment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const inters = [{ x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, shared other point', () => {
    const a = buildSegment({ x: 1, y: 1 }, { x: 0, y: 0 })
    const b = buildSegment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const inters = [{ x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, one encloses other', () => {
    const a = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
    const b = buildSegment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const inters = [{ x: 1, y: 1 }, { x: 2, y: 2 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, one encloses other 2', () => {
    const a = buildSegment({ x: 4, y: 0 }, { x: 0, y: 4 })
    const b = buildSegment({ x: 3, y: 1 }, { x: 1, y: 3 })
    const inters = [{ x: 1, y: 3 }, { x: 3, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, no overlap', () => {
    const a = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = buildSegment({ x: 2, y: 2 }, { x: 4, y: 4 })
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })

  test('parallel', () => {
    const a = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = buildSegment({ x: 0, y: -1 }, { x: 1, y: 0 })
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })

  test('parallel, orientation', () => {
    const a = buildSegment({ x: 1, y: 1 }, { x: 0, y: 0 })
    const b = buildSegment({ x: 0, y: -1 }, { x: 1, y: 0 })
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })

  test('parallel, position', () => {
    const a = buildSegment({ x: 0, y: -1 }, { x: 1, y: 0 })
    const b = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })
})

describe('compare segments', () => {
  describe('non intersecting', () => {
    test('not in same vertical space', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 1, y: 1 })
      const seg2 = buildSegment({ x: 4, y: 3 }, { x: 6, y: 7 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('in same vertical space, earlier is below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: -4 })
      const seg2 = buildSegment({ x: 1, y: 1 }, { x: 6, y: 7 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('in same vertical space, later is below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: -4 })
      const seg2 = buildSegment({ x: -5, y: -5 }, { x: 6, y: -7 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with left points in same vertical line', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = buildSegment({ x: 0, y: -1 }, { x: -5, y: -5 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with earlier right point directly under later left point', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = buildSegment({ x: -5, y: -5 }, { x: 0, y: -3 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with eariler right point directly over earlier left point', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = buildSegment({ x: -5, y: 5 }, { x: 0, y: 3 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('intersecting not on endpoint', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: -1, y: -5 }, { x: 1, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from directly over & below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: 0, y: -2 }, { x: 3, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from after & below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: 1, y: -2 }, { x: 3, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('later comes down from before & above', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: -1, y: 5 }, { x: 1, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from directly over & above', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: 0, y: 2 }, { x: 3, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from after & above', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: 1, y: 2 }, { x: 3, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('intersect but not share on an endpoint', () => {
    test('intersect on right', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: 2, y: -2 }, { x: 6, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('intersect on left from above', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: -2, y: 2 }, { x: 2, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('intersect on left from below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: -2, y: -2 }, { x: 2, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('share right endpoint', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: -1, y: -5 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from directly over & below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: 0, y: -2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from after & below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: 1, y: -2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('later comes down from before & above', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: -1, y: 5 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('laterjcomes up from directly over & above', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: 0, y: 2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from after & above', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = buildSegment({ x: 1, y: 2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('share left endpoint but not colinear', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })
  })

  describe('colinear', () => {
    test('partial mutal overlap', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = buildSegment({ x: -1, y: -1 }, { x: 2, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('complete overlap', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = buildSegment({ x: -1, y: -1 }, { x: 5, y: 5 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('right endpoints match', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = buildSegment({ x: -1, y: -1 }, { x: 4, y: 4 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('left endpoints match - should be sorted by ring id', () => {
      const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
      const seg2 = buildSegment({ x: 0, y: 0 }, { x: 3, y: 3 }, { id: 2 })
      const seg3 = buildSegment({ x: 0, y: 0 }, { x: 5, y: 5 }, { id: 3 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)

      expect(Segment.compare(seg2, seg3)).toBe(-1)
      expect(Segment.compare(seg3, seg2)).toBe(1)

      expect(Segment.compare(seg1, seg3)).toBe(-1)
      expect(Segment.compare(seg3, seg1)).toBe(1)
    })
  })

  test('exactly equal segments should be sorted by ring id', () => {
    const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    const seg2 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 2 })
    expect(Segment.compare(seg1, seg2)).toBe(-1)
    expect(Segment.compare(seg2, seg1)).toBe(1)
  })

  test('exactly equal segments (but not identical) should throw error', () => {
    const seg1 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    const seg2 = buildSegment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    expect(() => Segment.compare(seg1, seg2)).toThrow()
  })
})
