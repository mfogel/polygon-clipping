/* eslint-env jest */

// hard to unit test these structures as much of what they
// do is operate off of the result of the sweep line sweep

import Segment from '../src/segment'
import SweepEvent from '../src/sweep-event'
import { RingOut, PolyOut, MultiPolyOut } from '../src/geom-out'

describe('ring', () => {
  describe('factory', () => {
    test('simple triangle', () => {
      const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
      const t2 = SweepEvent.makeTwins({ x: 1, y: 1 })
      const t3 = SweepEvent.makeTwins({ x: 0, y: 1 })

      const seg1 = Segment.fromRing(t1[1], t2[0])
      const seg2 = Segment.fromRing(t2[1], t3[0])
      const seg3 = Segment.fromRing(t3[1], t1[0])

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true

      const rings = RingOut.factory([seg1, seg2, seg3])

      expect(rings.length).toBe(1)
      expect(rings[0].getGeom()).toEqual([[0, 0], [1, 1], [0, 1], [0, 0]])
    })

    test('bow tie', () => {
      const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
      const t2 = SweepEvent.makeTwins({ x: 1, y: 1 })
      const t3 = SweepEvent.makeTwins({ x: 0, y: 2 })

      const seg1 = Segment.fromRing(t1[1], t2[0])
      const seg2 = Segment.fromRing(t2[1], t3[0])
      const seg3 = Segment.fromRing(t3[1], t1[0])

      const t4 = SweepEvent.makeTwins({ x: 2, y: 0 })
      const t5 = SweepEvent.makeTwins({ x: 1, y: 1 })
      const t6 = SweepEvent.makeTwins({ x: 2, y: 2 })

      const seg4 = Segment.fromRing(t4[1], t5[0])
      const seg5 = Segment.fromRing(t5[1], t6[0])
      const seg6 = Segment.fromRing(t6[1], t4[0])

      const linkedEvents = [t2[0], t2[1], t5[0], t5[1]]
      t2[0].linkedEvents = linkedEvents
      t2[1].linkedEvents = linkedEvents
      t5[0].linkedEvents = linkedEvents
      t5[1].linkedEvents = linkedEvents

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true
      seg4._cache['isInResult'] = true
      seg5._cache['isInResult'] = true
      seg6._cache['isInResult'] = true

      const rings = RingOut.factory([seg1, seg2, seg3, seg4, seg5, seg6])

      expect(rings.length).toBe(2)
      expect(rings[0].getGeom()).toEqual([[0, 0], [1, 1], [0, 2], [0, 0]])
      expect(rings[1].getGeom()).toEqual([[1, 1], [2, 0], [2, 2], [1, 1]])
    })

    test('ringed ring', () => {
      const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
      const t2 = SweepEvent.makeTwins({ x: 3, y: -3 })
      const t3 = SweepEvent.makeTwins({ x: 3, y: 0 })
      const t4 = SweepEvent.makeTwins({ x: 3, y: 3 })

      const seg1 = Segment.fromRing(t1[1], t2[0])
      const seg2 = Segment.fromRing(t2[1], t3[0])
      const seg3 = Segment.fromRing(t3[1], t4[0])
      const seg4 = Segment.fromRing(t4[1], t1[0])

      const t5 = SweepEvent.makeTwins({ x: 2, y: -1 })
      const t6 = SweepEvent.makeTwins({ x: 3, y: 0 })
      const t7 = SweepEvent.makeTwins({ x: 2, y: 1 })

      const seg5 = Segment.fromRing(t5[1], t6[0])
      const seg6 = Segment.fromRing(t6[1], t7[0])
      const seg7 = Segment.fromRing(t7[1], t5[0])

      const linkedEvents = [t3[0], t3[1], t6[0], t6[1]]
      t3[0].linkedEvents = linkedEvents
      t3[1].linkedEvents = linkedEvents
      t6[0].linkedEvents = linkedEvents
      t6[1].linkedEvents = linkedEvents

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true
      seg4._cache['isInResult'] = true
      seg5._cache['isInResult'] = true
      seg6._cache['isInResult'] = true
      seg7._cache['isInResult'] = true

      const rings = RingOut.factory([seg1, seg2, seg3, seg4, seg5, seg6, seg7])

      expect(rings.length).toBe(2)
      expect(rings[0].getGeom()).toEqual([[3, 0], [2, 1], [2, -1], [3, 0]])
      expect(rings[1].getGeom()).toEqual([[0, 0], [3, -3], [3, 3], [0, 0]])
    })

    test('ringed ring interior ring starting point extraneous', () => {
      const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
      const t2 = SweepEvent.makeTwins({ x: 5, y: -5 })
      const t3 = SweepEvent.makeTwins({ x: 4, y: 0 })
      const t4 = SweepEvent.makeTwins({ x: 5, y: 5 })

      const seg1 = Segment.fromRing(t1[1], t2[0])
      const seg2 = Segment.fromRing(t2[1], t3[0])
      const seg3 = Segment.fromRing(t3[1], t4[0])
      const seg4 = Segment.fromRing(t4[1], t1[0])

      const t5 = SweepEvent.makeTwins({ x: 1, y: 0 })
      const t6 = SweepEvent.makeTwins({ x: 4, y: 1 })
      const t7 = SweepEvent.makeTwins({ x: 4, y: 0 })
      const t8 = SweepEvent.makeTwins({ x: 4, y: -1 })

      const seg5 = Segment.fromRing(t5[1], t6[0])
      const seg6 = Segment.fromRing(t6[1], t7[0])
      const seg7 = Segment.fromRing(t7[1], t8[0])
      const seg8 = Segment.fromRing(t8[1], t5[0])

      const linkedEvents = [t3[0], t3[1], t7[0], t7[1]]
      t3[0].linkedEvents = linkedEvents
      t3[1].linkedEvents = linkedEvents
      t7[0].linkedEvents = linkedEvents
      t7[1].linkedEvents = linkedEvents

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true
      seg4._cache['isInResult'] = true
      seg5._cache['isInResult'] = true
      seg6._cache['isInResult'] = true
      seg7._cache['isInResult'] = true
      seg8._cache['isInResult'] = true

      const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8]
      const rings = RingOut.factory(segs)

      expect(rings.length).toBe(2)
      expect(rings[0].getGeom()).toEqual([[4, 1], [1, 0], [4, -1], [4, 1]])
      expect(rings[1].getGeom()).toEqual([
        [0, 0],
        [5, -5],
        [4, 0],
        [5, 5],
        [0, 0]
      ])
    })

    test('ringed ring and bow tie at same point', () => {
      const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
      const t2 = SweepEvent.makeTwins({ x: 3, y: -3 })
      const t3 = SweepEvent.makeTwins({ x: 3, y: 0 })
      const t4 = SweepEvent.makeTwins({ x: 3, y: 3 })

      const seg1 = Segment.fromRing(t1[1], t2[0])
      const seg2 = Segment.fromRing(t2[1], t3[0])
      const seg3 = Segment.fromRing(t3[1], t4[0])
      const seg4 = Segment.fromRing(t4[1], t1[0])

      const t5 = SweepEvent.makeTwins({ x: 2, y: -1 })
      const t6 = SweepEvent.makeTwins({ x: 3, y: 0 })
      const t7 = SweepEvent.makeTwins({ x: 2, y: 1 })

      const seg5 = Segment.fromRing(t5[1], t6[0])
      const seg6 = Segment.fromRing(t6[1], t7[0])
      const seg7 = Segment.fromRing(t7[1], t5[0])

      const t8 = SweepEvent.makeTwins({ x: 3, y: 0 })
      const t9 = SweepEvent.makeTwins({ x: 4, y: -1 })
      const t10 = SweepEvent.makeTwins({ x: 4, y: 1 })

      const seg8 = Segment.fromRing(t8[1], t9[0])
      const seg9 = Segment.fromRing(t9[1], t10[0])
      const seg10 = Segment.fromRing(t10[1], t8[0])

      const linkedEvents = [t3[0], t3[1], t6[0], t6[1], t8[0], t8[1]]
      t3[0].linkedEvents = linkedEvents
      t3[1].linkedEvents = linkedEvents
      t6[0].linkedEvents = linkedEvents
      t6[1].linkedEvents = linkedEvents
      t8[0].linkedEvents = linkedEvents
      t8[1].linkedEvents = linkedEvents

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true
      seg4._cache['isInResult'] = true
      seg5._cache['isInResult'] = true
      seg6._cache['isInResult'] = true
      seg7._cache['isInResult'] = true
      seg8._cache['isInResult'] = true
      seg9._cache['isInResult'] = true
      seg10._cache['isInResult'] = true

      const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8, seg9, seg10]
      const rings = RingOut.factory(segs)

      expect(rings.length).toBe(3)
      expect(rings[0].getGeom()).toEqual([[3, 0], [2, 1], [2, -1], [3, 0]])
      expect(rings[1].getGeom()).toEqual([[0, 0], [3, -3], [3, 3], [0, 0]])
      expect(rings[2].getGeom()).toEqual([[3, 0], [4, -1], [4, 1], [3, 0]])
    })

    test('double bow tie', () => {
      const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
      const t2 = SweepEvent.makeTwins({ x: 1, y: -2 })
      const t3 = SweepEvent.makeTwins({ x: 1, y: 2 })

      const seg1 = Segment.fromRing(t1[1], t2[0])
      const seg2 = Segment.fromRing(t2[1], t3[0])
      const seg3 = Segment.fromRing(t3[1], t1[0])

      const t4 = SweepEvent.makeTwins({ x: 1, y: -2 })
      const t5 = SweepEvent.makeTwins({ x: 2, y: -3 })
      const t6 = SweepEvent.makeTwins({ x: 2, y: -1 })

      const seg4 = Segment.fromRing(t4[1], t5[0])
      const seg5 = Segment.fromRing(t5[1], t6[0])
      const seg6 = Segment.fromRing(t6[1], t4[0])

      const t7 = SweepEvent.makeTwins({ x: 1, y: 2 })
      const t8 = SweepEvent.makeTwins({ x: 2, y: 1 })
      const t9 = SweepEvent.makeTwins({ x: 2, y: 3 })

      const seg7 = Segment.fromRing(t7[1], t8[0])
      const seg8 = Segment.fromRing(t8[1], t9[0])
      const seg9 = Segment.fromRing(t9[1], t7[0])

      seg4.leftSE.link(seg1.rightSE)
      seg7.leftSE.link(seg2.rightSE)

      const linkedEvents1 = [t2[0], t2[1], t4[0], t4[1]]
      t2[0].linkedEvents = linkedEvents1
      t2[1].linkedEvents = linkedEvents1
      t4[0].linkedEvents = linkedEvents1
      t4[1].linkedEvents = linkedEvents1

      const linkedEvents2 = [t3[0], t3[1], t7[0], t7[1]]
      t3[0].linkedEvents = linkedEvents2
      t3[1].linkedEvents = linkedEvents2
      t7[0].linkedEvents = linkedEvents2
      t7[1].linkedEvents = linkedEvents2

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true
      seg4._cache['isInResult'] = true
      seg5._cache['isInResult'] = true
      seg6._cache['isInResult'] = true
      seg7._cache['isInResult'] = true
      seg8._cache['isInResult'] = true
      seg9._cache['isInResult'] = true

      const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8, seg9]
      const rings = RingOut.factory(segs)

      expect(rings.length).toBe(3)
      expect(rings[0].getGeom()).toEqual([[0, 0], [1, -2], [1, 2], [0, 0]])
      expect(rings[1].getGeom()).toEqual([[1, -2], [2, -3], [2, -1], [1, -2]])
      expect(rings[2].getGeom()).toEqual([[1, 2], [2, 1], [2, 3], [1, 2]])
    })

    test('double ringed ring', () => {
      const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
      const t2 = SweepEvent.makeTwins({ x: 5, y: -5 })
      const t3 = SweepEvent.makeTwins({ x: 5, y: 5 })

      const seg1 = Segment.fromRing(t1[1], t2[0])
      const seg2 = Segment.fromRing(t2[1], t3[0])
      const seg3 = Segment.fromRing(t3[1], t1[0])

      const t4 = SweepEvent.makeTwins({ x: 1, y: -1 })
      const t5 = SweepEvent.makeTwins({ x: 5, y: -5 })
      const t6 = SweepEvent.makeTwins({ x: 2, y: -1 })

      const seg4 = Segment.fromRing(t4[1], t5[0])
      const seg5 = Segment.fromRing(t5[1], t6[0])
      const seg6 = Segment.fromRing(t6[1], t4[0])

      const t7 = SweepEvent.makeTwins({ x: 1, y: 1 })
      const t8 = SweepEvent.makeTwins({ x: 5, y: 5 })
      const t9 = SweepEvent.makeTwins({ x: 2, y: 1 })

      const seg7 = Segment.fromRing(t7[1], t8[0])
      const seg8 = Segment.fromRing(t8[1], t9[0])
      const seg9 = Segment.fromRing(t9[1], t7[0])

      const linkedEvents1 = [t2[0], t2[1], t5[0], t5[1]]
      t2[0].linkedEvents = linkedEvents1
      t2[1].linkedEvents = linkedEvents1
      t5[0].linkedEvents = linkedEvents1
      t5[1].linkedEvents = linkedEvents1

      const linkedEvents2 = [t3[0], t3[1], t8[0], t8[1]]
      t3[0].linkedEvents = linkedEvents2
      t3[1].linkedEvents = linkedEvents2
      t8[0].linkedEvents = linkedEvents2
      t8[1].linkedEvents = linkedEvents2

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true
      seg4._cache['isInResult'] = true
      seg5._cache['isInResult'] = true
      seg6._cache['isInResult'] = true
      seg7._cache['isInResult'] = true
      seg8._cache['isInResult'] = true
      seg9._cache['isInResult'] = true

      const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8, seg9]
      const rings = RingOut.factory(segs)

      expect(rings.length).toBe(3)
      expect(rings[0].getGeom()).toEqual([[5, -5], [2, -1], [1, -1], [5, -5]])
      expect(rings[1].getGeom()).toEqual([[5, 5], [1, 1], [2, 1], [5, 5]])
      expect(rings[2].getGeom()).toEqual([[0, 0], [5, -5], [5, 5], [0, 0]])
    })

    test('errors on on malformed ring', () => {
      const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
      const t2 = SweepEvent.makeTwins({ x: 1, y: 1 })
      const t3 = SweepEvent.makeTwins({ x: 0, y: 1 })

      const seg1 = Segment.fromRing(t1[1], t2[0])
      const seg2 = Segment.fromRing(t2[1], t3[0])
      const seg3 = Segment.fromRing(t3[1], t1[0])

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = false // broken ring

      expect(() => RingOut.factory([seg1, seg2, seg3])).toThrow()
    })
  })

  test('exterior ring', () => {
    const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t2 = SweepEvent.makeTwins({ x: 1, y: 1 })
    const t3 = SweepEvent.makeTwins({ x: 0, y: 1 })

    const seg1 = Segment.fromRing(t1[1], t2[0])
    const seg2 = Segment.fromRing(t2[1], t3[0])
    const seg3 = Segment.fromRing(t3[1], t1[0])

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true

    const ring = RingOut.factory([seg1, seg2, seg3])[0]

    expect(ring.enclosingRing).toBeNull()
    expect(ring.isExteriorRing).toBeTruthy()
    expect(ring.getGeom()).toEqual([[0, 0], [1, 1], [0, 1], [0, 0]])
  })

  test('interior ring points reversed', () => {
    const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t2 = SweepEvent.makeTwins({ x: 1, y: 1 })
    const t3 = SweepEvent.makeTwins({ x: 0, y: 1 })

    const seg1 = Segment.fromRing(t1[1], t2[0])
    const seg2 = Segment.fromRing(t2[1], t3[0])
    const seg3 = Segment.fromRing(t3[1], t1[0])

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true

    const ring = RingOut.factory([seg1, seg2, seg3])[0]
    ring._cache = { isExteriorRing: false }

    expect(ring.isExteriorRing).toBeFalsy()
    expect(ring.getGeom()).toEqual([[0, 0], [0, 1], [1, 1], [0, 0]])
  })

  test('removes colinear points successfully', () => {
    const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t2 = SweepEvent.makeTwins({ x: 1, y: 1 })
    const t3 = SweepEvent.makeTwins({ x: 2, y: 2 })
    const t4 = SweepEvent.makeTwins({ x: 0, y: 2 })

    const seg1 = Segment.fromRing(t1[1], t2[0])
    const seg2 = Segment.fromRing(t2[1], t3[0])
    const seg3 = Segment.fromRing(t3[1], t4[0])
    const seg4 = Segment.fromRing(t4[1], t1[0])

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true
    seg4._cache['isInResult'] = true

    const ring = RingOut.factory([seg1, seg2, seg3, seg4])[0]

    expect(ring.getGeom()).toEqual([[0, 0], [2, 2], [0, 2], [0, 0]])
  })

  test('ring with all colinear points returns null', () => {
    const t1 = SweepEvent.makeTwins({ x: 0, y: 0 })
    const t2 = SweepEvent.makeTwins({ x: 1, y: 1 })
    const t3 = SweepEvent.makeTwins({ x: 2, y: 2 })
    const t4 = SweepEvent.makeTwins({ x: 3, y: 3 })

    const seg1 = Segment.fromRing(t1[1], t2[0])
    const seg2 = Segment.fromRing(t2[1], t3[0])
    const seg3 = Segment.fromRing(t3[1], t4[0])
    const seg4 = Segment.fromRing(t4[1], t1[0])

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true
    seg4._cache['isInResult'] = true

    const ring = RingOut.factory([seg1, seg2, seg3, seg4])[0]

    expect(ring.getGeom()).toEqual(null)
  })
})

describe('poly', () => {
  test('basic', () => {
    const ring1 = { registerPoly: jest.fn(), getGeom: () => 1 }
    const ring2 = { registerPoly: jest.fn(), getGeom: () => 2 }
    const ring3 = { registerPoly: jest.fn(), getGeom: () => 3 }

    const poly = new PolyOut(ring1)
    poly.addInterior(ring2)
    poly.addInterior(ring3)

    expect(ring1.registerPoly).toHaveBeenCalledWith(poly)
    expect(ring2.registerPoly).toHaveBeenCalledWith(poly)
    expect(ring3.registerPoly).toHaveBeenCalledWith(poly)

    expect(poly.getGeom()).toEqual([1, 2, 3])
  })

  test('has all colinear exterior ring', () => {
    const ring1 = { registerPoly: jest.fn(), getGeom: () => null }
    const poly = new PolyOut(ring1)

    expect(ring1.registerPoly).toHaveBeenCalledWith(poly)

    expect(poly.getGeom()).toEqual(null)
  })

  test('has all colinear interior ring', () => {
    const ring1 = { registerPoly: jest.fn(), getGeom: () => 1 }
    const ring2 = { registerPoly: jest.fn(), getGeom: () => null }
    const ring3 = { registerPoly: jest.fn(), getGeom: () => 3 }

    const poly = new PolyOut(ring1)
    poly.addInterior(ring2)
    poly.addInterior(ring3)

    expect(ring1.registerPoly).toHaveBeenCalledWith(poly)
    expect(ring2.registerPoly).toHaveBeenCalledWith(poly)
    expect(ring3.registerPoly).toHaveBeenCalledWith(poly)

    expect(poly.getGeom()).toEqual([1, 3])
  })
})

describe('multipoly', () => {
  test('basic', () => {
    const multipoly = new MultiPolyOut([])
    const poly1 = { getGeom: () => 0 }
    const poly2 = { getGeom: () => 1 }
    multipoly.polys = [poly1, poly2]

    expect(multipoly.getGeom()).toEqual([0, 1])
  })

  test('has poly with all colinear exterior ring', () => {
    const multipoly = new MultiPolyOut([])
    const poly1 = { getGeom: () => null }
    const poly2 = { getGeom: () => 1 }
    multipoly.polys = [poly1, poly2]

    expect(multipoly.getGeom()).toEqual([1])
  })
})
