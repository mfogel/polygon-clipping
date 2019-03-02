/* eslint-env jest */

// hard to unit test these structures as much of what they
// do is operate off of the result of the sweep line sweep

import Segment from '../src/segment'
import { RingOut, PolyOut, MultiPolyOut } from '../src/geom-out'

describe('ring', () => {
  describe('factory', () => {
    test('simple triangle', () => {
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 1, y: 1 }
      const p3 = { x: 0, y: 1 }

      const seg1 = Segment.fromRing(p1, p2)
      const seg2 = Segment.fromRing(p2, p3)
      const seg3 = Segment.fromRing(p3, p1)

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true

      const rings = RingOut.factory([seg1, seg2, seg3])

      expect(rings.length).toBe(1)
      expect(rings[0].getGeom()).toEqual([[0, 0], [1, 1], [0, 1], [0, 0]])
    })

    test('bow tie', () => {
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 1, y: 1 }
      const p3 = { x: 0, y: 2 }

      const seg1 = Segment.fromRing(p1, p2)
      const seg2 = Segment.fromRing(p2, p3)
      const seg3 = Segment.fromRing(p3, p1)

      const p4 = { x: 2, y: 0 }
      const p5 = p2
      const p6 = { x: 2, y: 2 }

      const seg4 = Segment.fromRing(p4, p5)
      const seg5 = Segment.fromRing(p5, p6)
      const seg6 = Segment.fromRing(p6, p4)

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
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 3, y: -3 }
      const p3 = { x: 3, y: 0 }
      const p4 = { x: 3, y: 3 }

      const seg1 = Segment.fromRing(p1, p2)
      const seg2 = Segment.fromRing(p2, p3)
      const seg3 = Segment.fromRing(p3, p4)
      const seg4 = Segment.fromRing(p4, p1)

      const p5 = { x: 2, y: -1 }
      const p6 = p3
      const p7 = { x: 2, y: 1 }

      const seg5 = Segment.fromRing(p5, p6)
      const seg6 = Segment.fromRing(p6, p7)
      const seg7 = Segment.fromRing(p7, p5)

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
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 5, y: -5 }
      const p3 = { x: 4, y: 0 }
      const p4 = { x: 5, y: 5 }

      const seg1 = Segment.fromRing(p1, p2)
      const seg2 = Segment.fromRing(p2, p3)
      const seg3 = Segment.fromRing(p3, p4)
      const seg4 = Segment.fromRing(p4, p1)

      const p5 = { x: 1, y: 0 }
      const p6 = { x: 4, y: 1 }
      const p7 = p3
      const p8 = { x: 4, y: -1 }

      const seg5 = Segment.fromRing(p5, p6)
      const seg6 = Segment.fromRing(p6, p7)
      const seg7 = Segment.fromRing(p7, p8)
      const seg8 = Segment.fromRing(p8, p5)

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
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 3, y: -3 }
      const p3 = { x: 3, y: 0 }
      const p4 = { x: 3, y: 3 }

      const seg1 = Segment.fromRing(p1, p2)
      const seg2 = Segment.fromRing(p2, p3)
      const seg3 = Segment.fromRing(p3, p4)
      const seg4 = Segment.fromRing(p4, p1)

      const p5 = { x: 2, y: -1 }
      const p6 = p3
      const p7 = { x: 2, y: 1 }

      const seg5 = Segment.fromRing(p5, p6)
      const seg6 = Segment.fromRing(p6, p7)
      const seg7 = Segment.fromRing(p7, p5)

      const p8 = p3
      const p9 = { x: 4, y: -1 }
      const p10 = { x: 4, y: 1 }

      const seg8 = Segment.fromRing(p8, p9)
      const seg9 = Segment.fromRing(p9, p10)
      const seg10 = Segment.fromRing(p10, p8)

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
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 1, y: -2 }
      const p3 = { x: 1, y: 2 }

      const seg1 = Segment.fromRing(p1, p2)
      const seg2 = Segment.fromRing(p2, p3)
      const seg3 = Segment.fromRing(p3, p1)

      const p4 = p2
      const p5 = { x: 2, y: -3 }
      const p6 = { x: 2, y: -1 }

      const seg4 = Segment.fromRing(p4, p5)
      const seg5 = Segment.fromRing(p5, p6)
      const seg6 = Segment.fromRing(p6, p4)

      const p7 = p3
      const p8 = { x: 2, y: 1 }
      const p9 = { x: 2, y: 3 }

      const seg7 = Segment.fromRing(p7, p8)
      const seg8 = Segment.fromRing(p8, p9)
      const seg9 = Segment.fromRing(p9, p7)

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
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 5, y: -5 }
      const p3 = { x: 5, y: 5 }

      const seg1 = Segment.fromRing(p1, p2)
      const seg2 = Segment.fromRing(p2, p3)
      const seg3 = Segment.fromRing(p3, p1)

      const p4 = { x: 1, y: -1 }
      const p5 = p2
      const p6 = { x: 2, y: -1 }

      const seg4 = Segment.fromRing(p4, p5)
      const seg5 = Segment.fromRing(p5, p6)
      const seg6 = Segment.fromRing(p6, p4)

      const p7 = { x: 1, y: 1 }
      const p8 = p3
      const p9 = { x: 2, y: 1 }

      const seg7 = Segment.fromRing(p7, p8)
      const seg8 = Segment.fromRing(p8, p9)
      const seg9 = Segment.fromRing(p9, p7)

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
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 1, y: 1 }
      const p3 = { x: 0, y: 1 }

      const seg1 = Segment.fromRing(p1, p2)
      const seg2 = Segment.fromRing(p2, p3)
      const seg3 = Segment.fromRing(p3, p1)

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = false // broken ring

      expect(() => RingOut.factory([seg1, seg2, seg3])).toThrow()
    })
  })

  test('exterior ring', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 1, y: 1 }
    const p3 = { x: 0, y: 1 }

    const seg1 = Segment.fromRing(p1, p2)
    const seg2 = Segment.fromRing(p2, p3)
    const seg3 = Segment.fromRing(p3, p1)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true

    const ring = RingOut.factory([seg1, seg2, seg3])[0]

    expect(ring.enclosingRing()).toBeNull()
    expect(ring.isExteriorRing()).toBe(true)
    expect(ring.getGeom()).toEqual([[0, 0], [1, 1], [0, 1], [0, 0]])
  })

  test('interior ring points reversed', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 1, y: 1 }
    const p3 = { x: 0, y: 1 }

    const seg1 = Segment.fromRing(p1, p2)
    const seg2 = Segment.fromRing(p2, p3)
    const seg3 = Segment.fromRing(p3, p1)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true

    const ring = RingOut.factory([seg1, seg2, seg3])[0]
    ring._isExteriorRing = false

    expect(ring.isExteriorRing()).toBe(false)
    expect(ring.getGeom()).toEqual([[0, 0], [0, 1], [1, 1], [0, 0]])
  })

  test('removes colinear points successfully', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 1, y: 1 }
    const p3 = { x: 2, y: 2 }
    const p4 = { x: 0, y: 2 }

    const seg1 = Segment.fromRing(p1, p2)
    const seg2 = Segment.fromRing(p2, p3)
    const seg3 = Segment.fromRing(p3, p4)
    const seg4 = Segment.fromRing(p4, p1)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true
    seg4._cache['isInResult'] = true

    const ring = RingOut.factory([seg1, seg2, seg3, seg4])[0]

    expect(ring.getGeom()).toEqual([[0, 0], [2, 2], [0, 2], [0, 0]])
  })

  test('almost equal point handled ok', () => {
    // points harvested from https://github.com/mfogel/polygon-clipping/issues/37
    const p1 = { x: 0.523985, y: 51.281651 }
    const p2 = { x: 0.5241, y: 51.2816 }
    const p3 = { x: 0.5240213684210527, y: 51.2816873684210 }
    const p4 = { x: 0.5239850000000027, y: 51.281651000000004 }  // almost equal to p1

    const seg1 = Segment.fromRing(p1, p2)
    const seg2 = Segment.fromRing(p2, p3)
    const seg3 = Segment.fromRing(p3, p4)
    const seg4 = Segment.fromRing(p4, p1)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true
    seg4._cache['isInResult'] = true

    const ring = RingOut.factory([seg1, seg2, seg3, seg4])[0]

    expect(ring.getGeom()).toEqual([
      [0.523985, 51.281651],
      [0.5241, 51.2816],
      [0.5240213684210527, 51.2816873684210],
      [0.523985, 51.281651]
    ])
  })

  test('ring with all colinear points returns null', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 1, y: 1 }
    const p3 = { x: 2, y: 2 }
    const p4 = { x: 3, y: 3 }

    const seg1 = Segment.fromRing(p1, p2)
    const seg2 = Segment.fromRing(p2, p3)
    const seg3 = Segment.fromRing(p3, p4)
    const seg4 = Segment.fromRing(p4, p1)

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
    const ring1 = { poly: null, getGeom: () => 1 }
    const ring2 = { poly: null, getGeom: () => 2 }
    const ring3 = { poly: null, getGeom: () => 3 }

    const poly = new PolyOut(ring1)
    poly.addInterior(ring2)
    poly.addInterior(ring3)

    expect(ring1.poly).toBe(poly)
    expect(ring2.poly).toBe(poly)
    expect(ring3.poly).toBe(poly)

    expect(poly.getGeom()).toEqual([1, 2, 3])
  })

  test('has all colinear exterior ring', () => {
    const ring1 = { poly: null, getGeom: () => null }
    const poly = new PolyOut(ring1)

    expect(ring1.poly).toBe(poly)

    expect(poly.getGeom()).toEqual(null)
  })

  test('has all colinear interior ring', () => {
    const ring1 = { poly: null, getGeom: () => 1 }
    const ring2 = { poly: null, getGeom: () => null }
    const ring3 = { poly: null, getGeom: () => 3 }

    const poly = new PolyOut(ring1)
    poly.addInterior(ring2)
    poly.addInterior(ring3)

    expect(ring1.poly).toBe(poly)
    expect(ring2.poly).toBe(poly)
    expect(ring3.poly).toBe(poly)

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
