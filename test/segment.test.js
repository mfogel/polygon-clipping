/* eslint-env jest */

import Segment from '../src/segment'

describe('constructor', () => {
  test('correct point on left and right 1', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 0, y: 1 }
    const seg = new Segment(p1, p2)
    expect(seg.leftSE.point).toEqual(p1)
    expect(seg.rightSE.point).toEqual(p2)
    expect(seg.flowL2R).toBeTruthy()
  })

  test('correct point on left and right 1', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: -1, y: 0 }
    const seg = new Segment(p1, p2)
    expect(seg.leftSE.point).toEqual(p2)
    expect(seg.rightSE.point).toEqual(p1)
    expect(seg.flowL2R).toBeFalsy()
  })

  test('attempt create segment with same poitns', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 0, y: 0 }
    expect(() => new Segment(p1, p2)).toThrow()
  })
})

describe('clone', () => {
  test('general', () => {
    const [pt1, pt2] = [{ x: 0, y: 5 }, { x: 10, y: 15 }]
    const seg = new Segment(pt1, pt2, {})
    const clone = seg.clone()
    expect(clone.leftSE).not.toBe(seg.leftSE)
    expect(clone.rightSE).not.toBe(seg.rightSE)
    expect(clone.leftSE.point).toEqual(seg.leftSE.point)
    expect(clone.rightSE.point).toEqual(seg.rightSE.point)
    expect(clone.ringIn).toBe(seg.ringIn)
    expect(clone.flowL2R).toBe(seg.flowL2R)
  })
})

describe('split', () => {
  test('on interior point', () => {
    const seg = new Segment({ x: 0, y: 0 }, { x: 10, y: 10 }, true)
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
    const seg = new Segment({ x: 0, y: 10 }, { x: 10, y: 0 }, false)
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
    const seg = new Segment({ x: 0, y: 0 }, { x: 10, y: 10 }, true)
    expect(() => seg.split([{ x: 0, y: 0 }])).toThrow()
    expect(() => seg.split([{ x: 10, y: 10 }])).toThrow()
  })

  test('on three interior points', () => {
    const [endPt1, endPt2] = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
    const seg = new Segment(endPt1, endPt2, true)
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
})

describe('simple properties - bbox, vector, points, isVertical', () => {
  test('general', () => {
    const seg = new Segment({ x: 1, y: 2 }, { x: 3, y: 4 })
    expect(seg.bbox).toEqual({ ll: { x: 1, y: 2 }, ur: { x: 3, y: 4 } })
    expect(seg.vector).toEqual({ x: 2, y: 2 })
    expect(seg.isVertical).toBeFalsy()
  })

  test('horizontal', () => {
    const seg = new Segment({ x: 1, y: 4 }, { x: 3, y: 4 })
    expect(seg.bbox).toEqual({ ll: { x: 1, y: 4 }, ur: { x: 3, y: 4 } })
    expect(seg.vector).toEqual({ x: 2, y: 0 })
    expect(seg.isVertical).toBeFalsy()
  })

  test('vertical', () => {
    const seg = new Segment({ x: 3, y: 2 }, { x: 3, y: 4 })
    expect(seg.bbox).toEqual({ ll: { x: 3, y: 2 }, ur: { x: 3, y: 4 } })
    expect(seg.vector).toEqual({ x: 0, y: 2 })
    expect(seg.isVertical).toBeTruthy()
  })
})

describe('segment getOtherSE', () => {
  test('left to right', () => {
    const seg = new Segment({ x: 0, y: 0 }, { x: 1, y: 0 }, true)
    expect(seg.getOtherSE(seg.leftSE)).toBe(seg.rightSE)
    expect(seg.leftSE.otherSE).toBe(seg.rightSE)
  })

  test('right to left', () => {
    const seg = new Segment({ x: 0, y: 0 }, { x: 1, y: 0 }, true)
    expect(seg.getOtherSE(seg.rightSE)).toBe(seg.leftSE)
    expect(seg.rightSE.otherSE).toBe(seg.leftSE)
  })

  test('doesnt work for Sweep Events that are from other Segments', () => {
    const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 0 }, true)
    const seg2 = new Segment({ x: 0, y: 0 }, { x: 1, y: 0 }, true)
    expect(() => seg1.getOtherSE(seg2.leftSE)).toThrow()
  })
})

describe('segment register ring', () => {
  test('unregistered at first', () => {
    const seg = new Segment({ x: 0, y: 0 }, { x: 1, y: 0 })
    expect(seg.ringOut).toBeNull()
  })

  test('register it', () => {
    const seg = new Segment({ x: 0, y: 0 }, { x: 1, y: 0 })
    const ring = {}
    seg.registerRingOut(ring)
    expect(seg.ringOut).toBe(ring)
  })
})

describe('is an endpoint', () => {
  const p1 = { x: 0, y: -1 }
  const p2 = { x: 1, y: 0 }
  const seg = new Segment(p1, p2)

  test('yup', () => {
    expect(seg.isAnEndpoint(p1)).toBeTruthy()
    expect(seg.isAnEndpoint(p2)).toBeTruthy()
  })

  test('nope', () => {
    expect(seg.isAnEndpoint({ x: -34, y: 46 })).toBeFalsy()
    expect(seg.isAnEndpoint({ x: 0, y: 0 })).toBeFalsy()
  })
})

describe('is Point On', () => {
  const p1 = { x: -1, y: -1 }
  const p2 = { x: 1, y: 1 }
  const seg = new Segment(p1, p2)

  test('yup', () => {
    expect(seg.isPointOn(p1)).toBeTruthy()
    expect(seg.isPointOn(p2)).toBeTruthy()
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
    const s1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = new Segment({ x: 0, y: 1 }, { x: 0, y: 0 })

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
    const s1 = new Segment({ x: 0, y: 1 }, { x: 3, y: 1 })
    const pt = { x: 2, y: 1 - Number.EPSILON }
    expect(s1.comparePoint(pt)).toBe(-1)
  })

  test('barely below', () => {
    const s1 = new Segment({ x: 0, y: 1 }, { x: 3, y: 1 })
    const pt = { x: 2, y: 1 + Number.EPSILON }
    expect(s1.comparePoint(pt)).toBe(1)
  })
})

describe('get intersections 2', () => {
  test('colinear full overlap', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const inters = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap upward slope', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 2, y: 2 })
    const s2 = new Segment({ x: 1, y: 1 }, { x: 3, y: 3 })
    const inters = [{ x: 1, y: 1 }, { x: 2, y: 2 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap downward slope', () => {
    const s1 = new Segment({ x: 0, y: 2 }, { x: 2, y: 0 })
    const s2 = new Segment({ x: -1, y: 3 }, { x: 1, y: 1 })
    const inters = [{ x: 0, y: 2 }, { x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap horizontal', () => {
    const s1 = new Segment({ x: 0, y: 1 }, { x: 2, y: 1 })
    const s2 = new Segment({ x: 1, y: 1 }, { x: 3, y: 1 })
    const inters = [{ x: 1, y: 1 }, { x: 2, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap vertical', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 0, y: 3 })
    const s2 = new Segment({ x: 0, y: 2 }, { x: 0, y: 4 })
    const inters = [{ x: 0, y: 2 }, { x: 0, y: 3 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear endpoint overlap', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = new Segment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const inters = [{ x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear no overlap', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = new Segment({ x: 3, y: 3 }, { x: 4, y: 4 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('parallel no overlap', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const s2 = new Segment({ x: 0, y: 3 }, { x: 1, y: 4 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('intersect general', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 2, y: 2 })
    const s2 = new Segment({ x: 0, y: 2 }, { x: 2, y: 0 })
    const inters = [{ x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('T-intersect with an endpoint', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 2, y: 2 })
    const s2 = new Segment({ x: 1, y: 1 }, { x: 5, y: 4 })
    const inters = [{ x: 1, y: 1 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('intersect with vertical', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 })
    const s2 = new Segment({ x: 3, y: 0 }, { x: 3, y: 44 })
    const inters = [{ x: 3, y: 3 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('intersect with horizontal', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 })
    const s2 = new Segment({ x: 0, y: 3 }, { x: 23, y: 3 })
    const inters = [{ x: 3, y: 3 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('horizontal and vertical T-intersection', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 5, y: 0 })
    const s2 = new Segment({ x: 3, y: 0 }, { x: 3, y: 5 })
    const inters = [{ x: 3, y: 0 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('horizontal and vertical general intersection', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 5, y: 0 })
    const s2 = new Segment({ x: 3, y: -5 }, { x: 3, y: 5 })
    const inters = [{ x: 3, y: 0 }]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('no intersection not even close', () => {
    const s1 = new Segment({ x: 1000, y: 10002 }, { x: 2000, y: 20002 })
    const s2 = new Segment({ x: -234, y: -123 }, { x: -12, y: -23 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('no intersection kinda close', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
    const s2 = new Segment({ x: 0, y: 10 }, { x: 10, y: 0 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('no intersection with vertical touching bbox', () => {
    const s1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
    const s2 = new Segment({ x: 2, y: -5 }, { x: 2, y: 0 })
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('shared point 1', () => {
    const a = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = new Segment({ x: 0, y: 1 }, { x: 0, y: 0 })
    const inters = [{ x: 0, y: 0 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('shared point 2', () => {
    const a = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = new Segment({ x: 0, y: 1 }, { x: 1, y: 1 })
    const inters = [{ x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('T-crossing', () => {
    const a = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = new Segment({ x: 0.5, y: 0.5 }, { x: 1, y: 0 })
    const inters = [{ x: 0.5, y: 0.5 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = new Segment({ x: 0, y: 0 }, { x: 10, y: 10 })
    const b = new Segment({ x: 1, y: 1 }, { x: 5, y: 5 })
    const inters = [{ x: 1, y: 1 }, { x: 5, y: 5 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('shared point + overlap', () => {
    const a = new Segment({ x: 1, y: 1 }, { x: 10, y: 10 })
    const b = new Segment({ x: 1, y: 1 }, { x: 5, y: 5 })
    const inters = [{ x: 1, y: 1 }, { x: 5, y: 5 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('mutual overlap', () => {
    const a = new Segment({ x: 3, y: 3 }, { x: 10, y: 10 })
    const b = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 })
    const inters = [{ x: 3, y: 3 }, { x: 5, y: 5 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const inters = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('full overlap, orientation', () => {
    const a = new Segment({ x: 1, y: 1 }, { x: 0, y: 0 })
    const b = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const inters = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, shared point', () => {
    const a = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = new Segment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const inters = [{ x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, shared other point', () => {
    const a = new Segment({ x: 1, y: 1 }, { x: 0, y: 0 })
    const b = new Segment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const inters = [{ x: 1, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, one encloses other', () => {
    const a = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
    const b = new Segment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const inters = [{ x: 1, y: 1 }, { x: 2, y: 2 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, one encloses other 2', () => {
    const a = new Segment({ x: 4, y: 0 }, { x: 0, y: 4 })
    const b = new Segment({ x: 3, y: 1 }, { x: 1, y: 3 })
    const inters = [{ x: 1, y: 3 }, { x: 3, y: 1 }]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, no overlap', () => {
    const a = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = new Segment({ x: 2, y: 2 }, { x: 4, y: 4 })
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })

  test('parallel', () => {
    const a = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const b = new Segment({ x: 0, y: -1 }, { x: 1, y: 0 })
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })

  test('parallel, orientation', () => {
    const a = new Segment({ x: 1, y: 1 }, { x: 0, y: 0 })
    const b = new Segment({ x: 0, y: -1 }, { x: 1, y: 0 })
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })

  test('parallel, position', () => {
    const a = new Segment({ x: 0, y: -1 }, { x: 1, y: 0 })
    const b = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })
})

describe('compare segments', () => {
  describe('non intersecting', () => {
    test('not in same vertical space', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
      const seg2 = new Segment({ x: 4, y: 3 }, { x: 6, y: 7 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('in same vertical space, earlier is below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: -4 })
      const seg2 = new Segment({ x: 1, y: 1 }, { x: 6, y: 7 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('in same vertical space, later is below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: -4 })
      const seg2 = new Segment({ x: -5, y: -5 }, { x: 6, y: -7 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with left points in same vertical line', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = new Segment({ x: 0, y: -1 }, { x: -5, y: -5 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with earlier right point directly under later left point', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = new Segment({ x: -5, y: -5 }, { x: 0, y: -3 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with eariler right point directly over earlier left point', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = new Segment({ x: -5, y: 5 }, { x: 0, y: 3 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('intersecting not on endpoint', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: -1, y: -5 }, { x: 1, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from directly over & below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: 0, y: -2 }, { x: 3, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from after & below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: 1, y: -2 }, { x: 3, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('later comes down from before & above', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: -1, y: 5 }, { x: 1, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from directly over & above', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: 0, y: 2 }, { x: 3, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from after & above', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: 1, y: 2 }, { x: 3, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('intersect but not share on an endpoint', () => {
    test('intersect on right', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: 2, y: -2 }, { x: 6, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('intersect on left from above', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: -2, y: 2 }, { x: 2, y: -2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('intersect on left from below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: -2, y: -2 }, { x: 2, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('share right endpoint', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: -1, y: -5 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from directly over & below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: 0, y: -2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from after & below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: 1, y: -2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('later comes down from before & above', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: -1, y: 5 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('laterjcomes up from directly over & above', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: 0, y: 2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from after & above', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 0 })
      const seg2 = new Segment({ x: 1, y: 2 }, { x: 4, y: 0 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('share left endpoint but not colinear', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = new Segment({ x: 0, y: 0 }, { x: 4, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })
  })

  describe('colinear', () => {
    test('partial mutal overlap', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = new Segment({ x: -1, y: -1 }, { x: 2, y: 2 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('complete overlap', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = new Segment({ x: -1, y: -1 }, { x: 5, y: 5 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('right endpoints match', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 })
      const seg2 = new Segment({ x: -1, y: -1 }, { x: 4, y: 4 })
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('left endpoints match - should be sorted by ring id', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
      const seg2 = new Segment({ x: 0, y: 0 }, { x: 3, y: 3 }, { id: 2 })
      const seg3 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 }, { id: 3 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)

      expect(Segment.compare(seg2, seg3)).toBe(-1)
      expect(Segment.compare(seg3, seg2)).toBe(1)

      expect(Segment.compare(seg1, seg3)).toBe(-1)
      expect(Segment.compare(seg3, seg1)).toBe(1)
    })
  })

  test('exactly equal segments should be sorted by ring id', () => {
    const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    const seg2 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 2 })
    expect(Segment.compare(seg1, seg2)).toBe(-1)
    expect(Segment.compare(seg2, seg1)).toBe(1)
  })

  test('exactly equal segments (but not identical) should throw error', () => {
    const seg1 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    const seg2 = new Segment({ x: 0, y: 0 }, { x: 4, y: 4 }, { id: 1 })
    expect(() => Segment.compare(seg1, seg2)).toThrow()
  })
})
