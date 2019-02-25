/* eslint-env jest */

import Segment from '../src/segment'
import SweepEvent from '../src/sweep-event'

describe('constructor', () => {
  test('general', () => {
    const leftSE = new SweepEvent({x: 0, y: 0})
    const rightSE = new SweepEvent({x: 1, y: 1})
    const ringsIn = []
    const seg = new Segment(leftSE, rightSE, ringsIn)
    expect(seg.ringsIn).toBe(ringsIn)
    expect(seg.leftSE).toBe(leftSE)
    expect(seg.leftSE.otherSE).toBe(rightSE)
    expect(seg.rightSE).toBe(rightSE)
    expect(seg.rightSE.otherSE).toBe(leftSE)
    expect(seg._cache).toEqual({})
    expect(seg.ringOut).toBe(undefined)
    expect(seg.prev).toBe(undefined)
    expect(seg.consumedBy).toBe(undefined)
  })

  test('segment Id increments', () => {
    const leftSE = new SweepEvent({x: 0, y: 0})
    const rightSE = new SweepEvent({x: 1, y: 1})
    const seg1 = new Segment(leftSE, rightSE, [])
    const seg2 = new Segment(leftSE, rightSE, [])
    expect(seg2.id - seg1.id).toBe(1)
  })
})

describe('fromRing', () => {
  test('correct point on left and right 1', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 0, y: 1 }
    const seg = Segment.fromRing(p1, p2)
    expect(seg.leftSE.point).toEqual(p1)
    expect(seg.rightSE.point).toEqual(p2)
  })

  test('correct point on left and right 1', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: -1, y: 0 }
    const seg = Segment.fromRing(p1, p2)
    expect(seg.leftSE.point).toEqual(p2)
    expect(seg.rightSE.point).toEqual(p1)
  })

  test('attempt create segment with same points', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 0, y: 0 }
    expect(() => Segment.fromRing(p1, p2)).toThrow()
  })
})

describe('split', () => {
  test('on interior point', () => {
    const seg = Segment.fromRing({ x: 0, y: 0 }, { x: 10, y: 10 }, true)
    const pt = { x: 5, y: 5 }
    const evts = seg.split(pt)
    expect(evts[0].segment).toBe(seg)
    expect(evts[0].point).toEqual(pt)
    expect(evts[0].isLeft).toBe(false)
    expect(evts[0].otherSE.otherSE).toBe(evts[0])
    expect(evts[1].segment.leftSE.segment).toBe(evts[1].segment)
    expect(evts[1].segment).not.toBe(seg)
    expect(evts[1].point).toEqual(pt)
    expect(evts[1].isLeft).toBe(true)
    expect(evts[1].otherSE.otherSE).toBe(evts[1])
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment)
  })

  test('on close-to-but-not-exactly interior point', () => {
    const seg = Segment.fromRing({ x: 0, y: 10 }, { x: 10, y: 0 }, false)
    const pt = { x: 5 + Number.EPSILON, y: 5 }
    const evts = seg.split(pt)
    expect(evts[0].segment).toBe(seg)
    expect(evts[0].point).toEqual(pt)
    expect(evts[0].isLeft).toBe(false)
    expect(evts[1].segment).not.toBe(seg)
    expect(evts[1].point).toEqual(pt)
    expect(evts[1].isLeft).toBe(true)
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment)
  })

  test('on three interior points', () => {
    const seg = Segment.fromRing({ x: 0, y: 0 }, { x: 10, y: 10 }, true)
    const [sPt1, sPt2, sPt3] = [{ x: 2, y: 2 }, { x: 4, y: 4 }, { x: 6, y: 6 }]

    const [orgLeftEvt, orgRightEvt] = [seg.leftSE, seg.rightSE]
    const newEvts3 = seg.split(sPt3)
    const newEvts2 = seg.split(sPt2)
    const newEvts1 = seg.split(sPt1)
    const newEvts = [].concat(newEvts1, newEvts2, newEvts3)

    expect(newEvts.length).toBe(6)

    expect(seg.leftSE).toBe(orgLeftEvt)
    let evt = newEvts.find(e => e.point === sPt1 && ! e.isLeft)
    expect(seg.rightSE).toBe(evt)

    evt = newEvts.find(e => e.point === sPt1 && e.isLeft)
    let otherEvt = newEvts.find(e => e.point === sPt2 && ! e.isLeft)
    expect(evt.segment).toBe(otherEvt.segment)

    evt = newEvts.find(e => e.point === sPt2 && e.isLeft)
    otherEvt = newEvts.find(e => e.point === sPt3 && ! e.isLeft)
    expect(evt.segment).toBe(otherEvt.segment)

    evt = newEvts.find(e => e.point === sPt3 && e.isLeft)
    expect(evt.segment).toBe(orgRightEvt.segment)
  })
})

describe('simple properties - bbox, vector', () => {
  test('general', () => {
    const seg = Segment.fromRing({ x: 1, y: 2 }, { x: 3, y: 4 })
    expect(seg.bbox()).toEqual({ ll: { x: 1, y: 2 }, ur: { x: 3, y: 4 } })
    expect(seg.vector()).toEqual({ x: 2, y: 2 })
  })

  test('horizontal', () => {
    const seg = Segment.fromRing({ x: 1, y: 4 }, { x: 3, y: 4 })
    expect(seg.bbox()).toEqual({ ll: { x: 1, y: 4 }, ur: { x: 3, y: 4 } })
    expect(seg.vector()).toEqual({ x: 2, y: 0 })
  })

  test('vertical', () => {
    const seg = Segment.fromRing({ x: 3, y: 2 }, { x: 3, y: 4 })
    expect(seg.bbox()).toEqual({ ll: { x: 3, y: 2 }, ur: { x: 3, y: 4 } })
    expect(seg.vector()).toEqual({ x: 0, y: 2 })
  })
})

describe('consume()', () => {
  test('not automatically consumed', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 1, y: 0 }
    const seg1 = Segment.fromRing(p1, p2, {id: 1})
    const seg2 = Segment.fromRing(p1, p2, {id: 2})
    expect(seg1.consumedBy).toBe(undefined)
    expect(seg2.consumedBy).toBe(undefined)
  })

  test('basic case', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 1, y: 0 }
    const seg1 = Segment.fromRing(p1, p2, {})
    const seg2 = Segment.fromRing(p1, p2, {})
    seg1.consume(seg2)
    expect(seg2.consumedBy).toBe(seg1)
    expect(seg1.consumedBy).toBe(undefined)
  })

  test('ealier in sweep line sorting consumes later', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 1, y: 0 }
    const seg1 = Segment.fromRing(p1, p2, {})
    const seg2 = Segment.fromRing(p1, p2, {})
    seg2.consume(seg1)
    expect(seg2.consumedBy).toBe(seg1)
    expect(seg1.consumedBy).toBe(undefined)
  })

  test('consuming cascades', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 0, y: 0 }
    const p3 = { x: 1, y: 0 }
    const p4 = { x: 1, y: 0 }
    const seg1 = Segment.fromRing(p1, p3, {})
    const seg2 = Segment.fromRing(p1, p3, {})
    const seg3 = Segment.fromRing(p2, p4, {})
    const seg4 = Segment.fromRing(p2, p4, {})
    const seg5 = Segment.fromRing(p2, p4, {})
    seg1.consume(seg2)
    seg4.consume(seg2)
    seg3.consume(seg2)
    seg3.consume(seg5)
    expect(seg1.consumedBy).toBe(undefined)
    expect(seg2.consumedBy).toBe(seg1)
    expect(seg3.consumedBy).toBe(seg1)
    expect(seg4.consumedBy).toBe(seg1)
    expect(seg5.consumedBy).toBe(seg1)
  })
})

describe('is an endpoint', () => {
  const p1 = { x: 0, y: -1 }
  const p2 = { x: 1, y: 0 }
  const seg = Segment.fromRing(p1, p2)

  test('yup', () => {
    expect(seg.isAnEndpoint(p1)).toBeTruthy()
    expect(seg.isAnEndpoint(p2)).toBeTruthy()
  })

  test('nope', () => {
    expect(seg.isAnEndpoint({ x: -34, y: 46 })).toBeFalsy()
    expect(seg.isAnEndpoint({ x: 0, y: 0 })).toBeFalsy()
  })
})

describe('comparison with point', () => {
  test('general', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = Segment.fromRing({ x: 0, y: 1 }, { x: 0, y: 0 })

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
    const s1 = Segment.fromRing({ x: 1, y: 1 }, { x: 3, y: 1 })
    const pt = { x: 2, y: 1 - Number.EPSILON }
    expect(s1.comparePoint(pt)).toBe(-1)
  })

  test('barely below', () => {
    const s1 = Segment.fromRing({ x: 1, y: 1 }, { x: 3, y: 1 })
    const pt = { x: 2, y: 1 + Number.EPSILON * 3 / 2 }
    expect(s1.comparePoint(pt)).toBe(1)
  })

  // harvested from #37
  test('downward-slopping segment with nearly touching point', () => {
    const seg = Segment.fromRing({ x: 0.523985, y: 51.281651 }, { x: 0.5241, y: 51.2816 })
    const pt = { x: 0.5239850000000027, y: 51.281651000000004 }
    expect(seg.comparePoint(pt)).toBe(1)
  })
})

describe('get intersections 2', () => {
  test('colinear full overlap', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    expect(s1.getIntersection(s2)).toBeNull()
    expect(s2.getIntersection(s1)).toBeNull()
  })

  test('colinear partial overlap upward slope', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 2, y: 2 })
    const s2 = Segment.fromRing({ x: 1, y: 1 }, { x: 3, y: 3 })
    const inter = { x: 1, y: 1 }
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('colinear partial overlap downward slope', () => {
    const s1 = Segment.fromRing({ x: 0, y: 2 }, { x: 2, y: 0 })
    const s2 = Segment.fromRing({ x: -1, y: 3 }, { x: 1, y: 1 })
    const inter = { x: 0, y: 2 }
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('colinear partial overlap horizontal', () => {
    const s1 = Segment.fromRing({ x: 0, y: 1 }, { x: 2, y: 1 })
    const s2 = Segment.fromRing({ x: 1, y: 1 }, { x: 3, y: 1 })
    const inter = { x: 1, y: 1 }
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('colinear partial overlap vertical', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 0, y: 3 })
    const s2 = Segment.fromRing({ x: 0, y: 2 }, { x: 0, y: 4 })
    const inter = { x: 0, y: 2 }
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('colinear endpoint overlap', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = Segment.fromRing({ x: 1, y: 1 }, { x: 2, y: 2 })
    expect(s1.getIntersection(s2)).toBeNull()
    expect(s2.getIntersection(s1)).toBeNull()
  })

  test('colinear no overlap', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = Segment.fromRing({ x: 3, y: 3 }, { x: 4, y: 4 })
    expect(s1.getIntersection(s2)).toBeNull()
    expect(s2.getIntersection(s1)).toBeNull()
  })

  test('parallel no overlap', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = Segment.fromRing({ x: 0, y: 3 }, { x: 1, y: 4 })
    expect(s1.getIntersection(s2)).toBeNull()
    expect(s2.getIntersection(s1)).toBeNull()
  })

  test('intersect general', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 2, y: 2 })
    const s2 = Segment.fromRing({ x: 0, y: 2 }, { x: 2, y: 0 })
    const inter = { x: 1, y: 1 }
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('T-intersect with an endpoint', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 2, y: 2 })
    const s2 = Segment.fromRing({ x: 1, y: 1 }, { x: 5, y: 4 })
    const inter = { x: 1, y: 1 }
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('intersect with vertical', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 5, y: 5 })
    const s2 = Segment.fromRing({ x: 3, y: 0 }, { x: 3, y: 44 })
    const inter = { x: 3, y: 3 } 
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('intersect with horizontal', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 5, y: 5 })
    const s2 = Segment.fromRing({ x: 0, y: 3 }, { x: 23, y: 3 })
    const inter = { x: 3, y: 3 }
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('horizontal and vertical T-intersection', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 5, y: 0 })
    const s2 = Segment.fromRing({ x: 3, y: 0 }, { x: 3, y: 5 })
    const inter = { x: 3, y: 0 }
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('horizontal and vertical general intersection', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 5, y: 0 })
    const s2 = Segment.fromRing({ x: 3, y: -5 }, { x: 3, y: 5 })
    const inter = { x: 3, y: 0 }
    expect(s1.getIntersection(s2)).toMatchObject(inter)
    expect(s2.getIntersection(s1)).toMatchObject(inter)
  })

  test('no intersection not even close', () => {
    const s1 = Segment.fromRing({ x: 1000, y: 10002 }, { x: 2000, y: 20002 })
    const s2 = Segment.fromRing({ x: -234, y: -123 }, { x: -12, y: -23 })
    expect(s1.getIntersection(s2)).toBeNull()
    expect(s2.getIntersection(s1)).toBeNull()
  })

  test('no intersection kinda close', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
    const s2 = Segment.fromRing({ x: 0, y: 10 }, { x: 10, y: 0 })
    expect(s1.getIntersection(s2)).toBeNull()
    expect(s2.getIntersection(s1)).toBeNull()
  })

  test('no intersection with vertical touching bbox', () => {
    const s1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
    const s2 = Segment.fromRing({ x: 2, y: -5 }, { x: 2, y: 0 })
    expect(s1.getIntersection(s2)).toBeNull()
    expect(s2.getIntersection(s1)).toBeNull()
  })

  test('shared point 1 (endpoint)', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = Segment.fromRing({ x: 0, y: 1 }, { x: 0, y: 0 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('shared point 2 (endpoint)', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = Segment.fromRing({x: 0, y: 1 }, { x: 1, y: 1 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('T-crossing left endpoint', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = Segment.fromRing({ x: 0.5, y: 0.5 }, { x: 1, y: 0 })
    const inter = { x: 0.5, y: 0.5 }
    expect(a.getIntersection(b)).toMatchObject(inter)
    expect(b.getIntersection(a)).toMatchObject(inter)
  })

  test('T-crossing right endpoint', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = Segment.fromRing({ x: 0, y: 1 }, { x: 0.5, y: 0.5 })
    const inter = { x: 0.5, y: 0.5 }
    expect(a.getIntersection(b)).toMatchObject(inter)
    expect(b.getIntersection(a)).toMatchObject(inter)
  })

  test('full overlap', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 10, y: 10 })
    const b = Segment.fromRing({ x: 1, y: 1 }, { x: 5, y: 5 })
    const inter = { x: 1, y: 1 }
    expect(a.getIntersection(b)).toMatchObject(inter)
    expect(b.getIntersection(a)).toMatchObject(inter)
  })

  test('shared point + overlap', () => {
    const a = Segment.fromRing({ x: 1, y: 1 }, { x: 10, y: 10 })
    const b = Segment.fromRing({ x: 1, y: 1 }, { x: 5, y: 5 })
    const inter = { x: 5, y: 5 }
    expect(a.getIntersection(b)).toMatchObject(inter)
    expect(b.getIntersection(a)).toMatchObject(inter)
  })

  test('mutual overlap', () => {
    const a = Segment.fromRing({ x: 3, y: 3 }, { x: 10, y: 10 })
    const b = Segment.fromRing({ x: 0, y: 0 }, { x: 5, y: 5 })
    const inter = { x: 3, y: 3 }
    expect(a.getIntersection(b)).toMatchObject(inter)
    expect(b.getIntersection(a)).toMatchObject(inter)
  })

  test('full overlap', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('full overlap, orientation', () => {
    const a = Segment.fromRing({ x: 1, y: 1 }, { x: 0, y: 0 })
    const b = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('colinear, shared point', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = Segment.fromRing({ x: 1, y: 1 }, { x: 2, y: 2 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('colinear, shared other point', () => {
    const a = Segment.fromRing({ x: 1, y: 1 }, { x: 0, y: 0 })
    const b = Segment.fromRing({ x: 1, y: 1 }, { x: 2, y: 2 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('colinear, one encloses other', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
    const b = Segment.fromRing({ x: 1, y: 1 }, { x: 2, y: 2 })
    const inter = { x: 1, y: 1 }
    expect(a.getIntersection(b)).toMatchObject(inter)
    expect(b.getIntersection(a)).toMatchObject(inter)
  })

  test('colinear, one encloses other 2', () => {
    const a = Segment.fromRing({ x: 4, y: 0 }, { x: 0, y: 4 })
    const b = Segment.fromRing({ x: 3, y: 1 }, { x: 1, y: 3 })
    const inter = { x: 1, y: 3 }
    expect(a.getIntersection(b)).toMatchObject(inter)
    expect(b.getIntersection(a)).toMatchObject(inter)
  })

  test('colinear, no overlap', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = Segment.fromRing({ x: 2, y: 2 }, { x: 4, y: 4 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('parallel', () => {
    const a = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = Segment.fromRing({ x: 0, y: -1 }, { x: 1, y: 0 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('parallel, orientation', () => {
    const a = Segment.fromRing({ x: 1, y: 1 }, { x: 0, y: 0 })
    const b = Segment.fromRing({ x: 0, y: -1 }, { x: 1, y: 0 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('parallel, position', () => {
    const a = Segment.fromRing({ x: 0, y: -1 }, { x: 1, y: 0 })
    const b = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
    expect(a.getIntersection(b)).toBeNull()
    expect(b.getIntersection(a)).toBeNull()
  })

  test('endpoint intersections should be consistent - issue 60', () => {
    // If segment A T-intersects segment B, then the non-intersecting endpoint
    // of segment A should be irrelevant to the intersection of the two segs
    // From https://github.com/mfogel/polygon-clipping/issues/60
    const x = -91.41360941065206, y = 29.53135
    const segA1 = Segment.fromRing({ x: x, y: y}, { x: -91.4134943, y: 29.5310677 })
    const segA2 = Segment.fromRing({ x: x, y: y}, { x: -91.413, y: 29.5315 })
    const segB = Segment.fromRing(
      { x: -91.4137213, y: 29.5316244 },
      { x: -91.41352785864918, y: 29.53115 }
    )

    expect(segA1.getIntersection(segB)).toMatchObject({x: x, y: y})
    expect(segA2.getIntersection(segB)).toMatchObject({x: x, y: y})
    expect(segB.getIntersection(segA1)).toMatchObject({x: x, y: y})
    expect(segB.getIntersection(segA2)).toMatchObject({x: x, y: y})
  })

  test('endpoint intersection takes priority - issue 60-5', () => {
    const endX = 55.31
    const endY = -0.23544126113
    const segA = Segment.fromRing({ x: 18.60315316392773, y: 10.491431056669754 }, { x: endX, y: endY })
    const segB = Segment.fromRing({ x: -32.42, y: 55.26 }, { x: endX, y: endY })

    expect(segA.getIntersection(segB)).toBeNull()
    expect(segB.getIntersection(segA)).toBeNull()
  })
})

describe('compare segments', () => {
  describe('non intersecting', () => {
    test('not in same vertical space', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 1, y: 1 })
      const seg2 = Segment.fromRing({ x: 4, y: 3 }, { x: 6, y: 7 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('in same vertical space, earlier is below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: -4 })
      const seg2 = Segment.fromRing({ x: 1, y: 1 }, { x: 6, y: 7 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('in same vertical space, later is below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: -4 })
      const seg2 = Segment.fromRing({ x: -5, y: -5 }, { x: 6, y: -7 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with left points in same vertical line', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = Segment.fromRing({ x: 0, y: -1 }, { x: -5, y: -5 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with earlier right point directly under later left point', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = Segment.fromRing({ x: -5, y: -5 }, { x: 0, y: -3 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with eariler right point directly over earlier left point', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = Segment.fromRing({ x: -5, y: 5 }, { x: 0, y: 3 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('intersecting not on endpoint', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: -1, y: -5 }, { x: 1, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from directly over & below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 0, y: -2 }, { x: 3, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from after & below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 1, y: -2 }, { x: 3, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('later comes down from before & above', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: -1, y: 5 }, { x: 1, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from directly over & above', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 0, y: 2 }, { x: 3, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from after & above', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 1, y: 2 }, { x: 3, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('with a vertical', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 1, y: -2 }, { x: 1, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })
  })

  describe('intersect but not share on an endpoint', () => {
    test('intersect on right', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 2, y: -2 }, { x: 6, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('intersect on left from above', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: -2, y: 2 }, { x: 2, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('intersect on left from below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: -2, y: -2 }, { x: 2, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('intersect on left from vertical', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 0, y: -2 }, { x: 0, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })
  })

  describe('share right endpoint', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: -1, y: -5 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from directly over & below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 0, y: -2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from after & below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 1, y: -2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('later comes down from before & above', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: -1, y: 5 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('laterjcomes up from directly over & above', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 0, y: 2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from after & above', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = Segment.fromRing({ x: 1, y: 2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('share left endpoint but not colinear', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('one vertical, other not', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 0, y: 4 })
      const seg2 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('one segment thinks theyre colinear, but the other says no', () => {
      const seg1 = Segment.fromRing({ x: -60.6876, y: -40.83428174062278 }, { x: -60.6841701, y: -40.83491 })
      const seg2 = Segment.fromRing({ x: -60.6876, y: -40.83428174062278 }, { x: -60.6874, y: -40.83431837489067 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })
  })

  describe('colinear', () => {
    test('partial mutal overlap', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = Segment.fromRing({ x: -1, y: -1 }, { x: 2, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('complete overlap', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = Segment.fromRing({ x: -1, y: -1 }, { x: 5, y: 5 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('right endpoints match', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = Segment.fromRing({ x: -1, y: -1 }, { x: 4, y: 4 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('left endpoints match - should be length', () => {
      const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
      const seg2 = Segment.fromRing({ x: 0, y: 0 }, { x: 3, y: 3 }, { id: 2 })
      const seg3 = Segment.fromRing({ x: 0, y: 0 }, { x: 5, y: 5 }, { id: 3 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)

      expect(Segment.compare(seg2, seg3)).toBe(-1)
      expect(Segment.compare(seg3, seg2)).toBe(1)

      expect(Segment.compare(seg1, seg3)).toBe(-1)
      expect(Segment.compare(seg3, seg1)).toBe(1)
    })
  })

  test('exactly equal segments should be sorted by ring id', () => {
    const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    const seg2 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 2 })
    expect(Segment.compare(seg1, seg2)).toBe(-1)
    expect(Segment.compare(seg2, seg1)).toBe(1)
  })

  test('exactly equal segments (but not identical) are consistent', () => {
    const seg1 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    const seg2 = Segment.fromRing({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    const result = Segment.compare(seg1, seg2)
    expect(Segment.compare(seg1, seg2)).toBe(result)
    expect(Segment.compare(seg2, seg1)).toBe(result * -1)
  })

  test('segment consistency - from #60', () => {
    const seg1 = Segment.fromRing({ x: -131.57153657554915, y: 55.01963125 }, { x: -131.571478, y: 55.0187174 })
    const seg2 = Segment.fromRing({ x: -131.57153657554915, y: 55.01963125 }, { x: -131.57152375603846, y: 55.01943125 })
    expect(Segment.compare(seg1, seg2)).toBe(-1)
    expect(Segment.compare(seg2, seg1)).toBe(1)
  })

  test('ensure transitive - part of issue 60', () => {
    const seg2 = Segment.fromRing({ x: -10.000000000000018, y: -9.17 }, { x: -10.000000000000004, y: -8.79 })
    const seg6 = Segment.fromRing({ x: -10.000000000000016, y: 1.44 }, { x: -9, y: 1.5 })
    const seg4 = Segment.fromRing({ x: -10.00000000000001, y: 1.75 }, { x: -9, y: 1.5 })
    expect(Segment.compare(seg2, seg6)).toBe(-1)
    expect(Segment.compare(seg6, seg4)).toBe(-1)
    expect(Segment.compare(seg2, seg4)).toBe(-1)
  })
})
