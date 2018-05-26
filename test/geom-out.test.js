/* eslint-env jest */

// hard to unit test these structures as much of what they
// do is operate off of the result of the sweep line sweep

import Segment from '../src/segment'
import { Ring, Poly, MultiPoly } from '../src/geom-out'

describe('ring', () => {
  describe('factory', () => {
    test('simple triangle', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
      const seg2 = new Segment({ x: 1, y: 1 }, { x: 0, y: 1 })
      const seg3 = new Segment({ x: 0, y: 1 }, { x: 0, y: 0 })

      seg1.rightSE.link(seg2.rightSE)
      seg2.leftSE.link(seg3.rightSE)
      seg3.leftSE.link(seg1.leftSE)

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true

      const rings = Ring.factory([seg1, seg2, seg3])

      expect(rings.length).toBe(1)
      expect(rings[0].getGeom()).toEqual([[0, 0], [1, 1], [0, 1], [0, 0]])
    })

    test('bow tie', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
      const seg2 = new Segment({ x: 1, y: 1 }, { x: 0, y: 2 })
      const seg3 = new Segment({ x: 0, y: 2 }, { x: 0, y: 0 })

      seg1.rightSE.link(seg2.rightSE)
      seg2.leftSE.link(seg3.rightSE)
      seg3.leftSE.link(seg1.leftSE)

      const seg4 = new Segment({ x: 1, y: 1 }, { x: 2, y: 0 })
      const seg5 = new Segment({ x: 1, y: 1 }, { x: 2, y: 2 })
      const seg6 = new Segment({ x: 0, y: 2 }, { x: 2, y: 2 })

      seg4.leftSE.link(seg5.leftSE)
      seg4.rightSE.link(seg6.leftSE)
      seg5.rightSE.link(seg6.rightSE)

      seg4.leftSE.link(seg1.rightSE)

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true
      seg4._cache['isInResult'] = true
      seg5._cache['isInResult'] = true
      seg6._cache['isInResult'] = true

      const rings = Ring.factory([seg1, seg2, seg3, seg4, seg5, seg6])

      expect(rings.length).toBe(2)
      expect(rings[0].getGeom()).toEqual([[0, 0], [1, 1], [0, 2], [0, 0]])
      expect(rings[1].getGeom()).toEqual([[1, 1], [2, 0], [2, 2], [1, 1]])
    })

    test('ringed ring', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 3, y: -3 })
      const seg2 = new Segment({ x: 3, y: -3 }, { x: 3, y: 0 })
      const seg3 = new Segment({ x: 3, y: 0 }, { x: 3, y: 3 })
      const seg4 = new Segment({ x: 0, y: 0 }, { x: 3, y: 3 })

      seg1.rightSE.link(seg2.leftSE)
      seg2.rightSE.link(seg3.leftSE)
      seg3.rightSE.link(seg4.rightSE)
      seg4.leftSE.link(seg1.leftSE)

      const seg5 = new Segment({ x: 2, y: -1 }, { x: 3, y: 0 })
      const seg6 = new Segment({ x: 2, y: 1 }, { x: 3, y: 0 })
      const seg7 = new Segment({ x: 2, y: -1 }, { x: 2, y: 1 })

      seg5.leftSE.link(seg7.leftSE)
      seg5.rightSE.link(seg6.rightSE)
      seg6.leftSE.link(seg7.rightSE)

      seg5.rightSE.link(seg2.rightSE)

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true
      seg4._cache['isInResult'] = true
      seg5._cache['isInResult'] = true
      seg6._cache['isInResult'] = true
      seg7._cache['isInResult'] = true

      const rings = Ring.factory([seg1, seg2, seg3, seg4, seg5, seg6, seg7])

      expect(rings.length).toBe(2)
      expect(rings[0].getGeom()).toEqual([[3, 0], [2, 1], [2, -1], [3, 0]])
      expect(rings[1].getGeom()).toEqual([[0, 0], [3, -3], [3, 3], [0, 0]])
    })

    test('ringed ring interior ring starting point extraneous', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 5, y: -5 })
      const seg2 = new Segment({ x: 4, y: 0 }, { x: 5, y: -5 })
      const seg3 = new Segment({ x: 4, y: 0 }, { x: 5, y: 5 })
      const seg4 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 })

      seg1.leftSE.link(seg4.leftSE)
      seg1.rightSE.link(seg2.rightSE)
      seg2.leftSE.link(seg3.leftSE)
      seg3.rightSE.link(seg4.rightSE)

      const seg5 = new Segment({ x: 1, y: 0 }, { x: 4, y: 1 })
      const seg6 = new Segment({ x: 1, y: 0 }, { x: 4, y: -1 })
      const seg7 = new Segment({ x: 4, y: -1 }, { x: 4, y: 0 })
      const seg8 = new Segment({ x: 4, y: 0 }, { x: 4, y: 1 })

      seg5.leftSE.link(seg6.leftSE)
      seg5.rightSE.link(seg8.rightSE)
      seg6.rightSE.link(seg7.leftSE)
      seg7.rightSE.link(seg8.leftSE)

      seg7.rightSE.link(seg2.leftSE)

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = true
      seg4._cache['isInResult'] = true
      seg5._cache['isInResult'] = true
      seg6._cache['isInResult'] = true
      seg7._cache['isInResult'] = true
      seg8._cache['isInResult'] = true

      const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8]
      const rings = Ring.factory(segs)

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
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 3, y: -3 })
      const seg2 = new Segment({ x: 3, y: -3 }, { x: 3, y: 0 })
      const seg3 = new Segment({ x: 3, y: 0 }, { x: 3, y: 3 })
      const seg4 = new Segment({ x: 0, y: 0 }, { x: 3, y: 3 })

      seg1.rightSE.link(seg2.leftSE)
      seg2.rightSE.link(seg3.leftSE)
      seg3.rightSE.link(seg4.rightSE)
      seg4.leftSE.link(seg1.leftSE)

      const seg5 = new Segment({ x: 2, y: -1 }, { x: 3, y: 0 })
      const seg6 = new Segment({ x: 2, y: 1 }, { x: 3, y: 0 })
      const seg7 = new Segment({ x: 2, y: -1 }, { x: 2, y: 1 })

      seg5.leftSE.link(seg7.leftSE)
      seg5.rightSE.link(seg6.rightSE)
      seg6.leftSE.link(seg7.rightSE)

      const seg8 = new Segment({ x: 3, y: 0 }, { x: 4, y: -1 })
      const seg9 = new Segment({ x: 3, y: 0 }, { x: 4, y: 1 })
      const seg10 = new Segment({ x: 4, y: -1 }, { x: 4, y: 1 })

      seg8.leftSE.link(seg9.leftSE)
      seg8.rightSE.link(seg10.leftSE)
      seg9.rightSE.link(seg10.rightSE)

      seg5.rightSE.link(seg2.rightSE)
      seg8.leftSE.link(seg2.rightSE)

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
      const rings = Ring.factory(segs)

      expect(rings.length).toBe(3)
      expect(rings[0].getGeom()).toEqual([[3, 0], [2, 1], [2, -1], [3, 0]])
      expect(rings[1].getGeom()).toEqual([[0, 0], [3, -3], [3, 3], [0, 0]])
      expect(rings[2].getGeom()).toEqual([[3, 0], [4, -1], [4, 1], [3, 0]])
    })

    test('double bow tie', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: -2 })
      const seg2 = new Segment({ x: 0, y: 0 }, { x: 1, y: 2 })
      const seg3 = new Segment({ x: 1, y: -2 }, { x: 1, y: 2 })

      seg1.leftSE.link(seg2.leftSE)
      seg1.rightSE.link(seg3.leftSE)
      seg2.rightSE.link(seg3.rightSE)

      const seg4 = new Segment({ x: 1, y: -2 }, { x: 2, y: -3 })
      const seg5 = new Segment({ x: 1, y: -2 }, { x: 2, y: -1 })
      const seg6 = new Segment({ x: 2, y: -3 }, { x: 2, y: -1 })

      seg4.leftSE.link(seg5.leftSE)
      seg4.rightSE.link(seg6.leftSE)
      seg5.rightSE.link(seg6.rightSE)

      const seg7 = new Segment({ x: 1, y: 2 }, { x: 2, y: 1 })
      const seg8 = new Segment({ x: 1, y: 2 }, { x: 2, y: 3 })
      const seg9 = new Segment({ x: 2, y: 1 }, { x: 2, y: 3 })

      seg7.leftSE.link(seg8.leftSE)
      seg7.rightSE.link(seg9.leftSE)
      seg8.rightSE.link(seg9.rightSE)

      seg4.leftSE.link(seg1.rightSE)
      seg7.leftSE.link(seg2.rightSE)

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
      const rings = Ring.factory(segs)

      expect(rings.length).toBe(3)
      expect(rings[0].getGeom()).toEqual([[0, 0], [1, -2], [1, 2], [0, 0]])
      expect(rings[1].getGeom()).toEqual([[1, -2], [2, -3], [2, -1], [1, -2]])
      expect(rings[2].getGeom()).toEqual([[1, 2], [2, 1], [2, 3], [1, 2]])
    })

    test('double ringed ring', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 5, y: -5 })
      const seg2 = new Segment({ x: 0, y: 0 }, { x: 5, y: 5 })
      const seg3 = new Segment({ x: 5, y: -5 }, { x: 5, y: 5 })

      seg1.leftSE.link(seg2.leftSE)
      seg1.rightSE.link(seg3.leftSE)
      seg2.rightSE.link(seg3.rightSE)

      const seg4 = new Segment({ x: 1, y: -1 }, { x: 5, y: -5 })
      const seg5 = new Segment({ x: 1, y: -1 }, { x: 2, y: -1 })
      const seg6 = new Segment({ x: 2, y: -1 }, { x: 5, y: -5 })

      seg4.leftSE.link(seg5.leftSE)
      seg4.rightSE.link(seg6.rightSE)
      seg5.rightSE.link(seg6.leftSE)

      const seg7 = new Segment({ x: 1, y: 1 }, { x: 2, y: 1 })
      const seg8 = new Segment({ x: 1, y: 1 }, { x: 5, y: 5 })
      const seg9 = new Segment({ x: 2, y: 1 }, { x: 5, y: 5 })

      seg7.leftSE.link(seg8.leftSE)
      seg7.rightSE.link(seg9.leftSE)
      seg8.rightSE.link(seg9.rightSE)

      seg4.rightSE.link(seg1.rightSE)
      seg8.rightSE.link(seg2.rightSE)

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
      const rings = Ring.factory(segs)

      expect(rings.length).toBe(3)
      expect(rings[0].getGeom()).toEqual([[5, -5], [2, -1], [1, -1], [5, -5]])
      expect(rings[1].getGeom()).toEqual([[5, 5], [1, 1], [2, 1], [5, 5]])
      expect(rings[2].getGeom()).toEqual([[0, 0], [5, -5], [5, 5], [0, 0]])
    })

    test('errors on on malformed ring', () => {
      const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
      const seg2 = new Segment({ x: 1, y: 1 }, { x: 0, y: 1 })
      const seg3 = new Segment({ x: 0, y: 1 }, { x: 0, y: 0 })

      seg1.rightSE.link(seg2.rightSE)
      seg2.leftSE.link(seg3.rightSE)
      seg3.leftSE.link(seg1.leftSE)

      seg1._cache['isInResult'] = true
      seg2._cache['isInResult'] = true
      seg3._cache['isInResult'] = false // broken ring

      expect(() => Ring.factory([seg1, seg2, seg3])).toThrow()
    })
  })

  test('exterior ring', () => {
    const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const seg2 = new Segment({ x: 1, y: 1 }, { x: 0, y: 1 })
    const seg3 = new Segment({ x: 0, y: 1 }, { x: 0, y: 0 })

    seg1.rightSE.link(seg2.rightSE)
    seg2.leftSE.link(seg3.rightSE)
    seg3.leftSE.link(seg1.leftSE)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true

    const ring = Ring.factory([seg1, seg2, seg3])[0]

    expect(ring.enclosingRing).toBeNull()
    expect(ring.isExteriorRing).toBeTruthy()
    expect(ring.getGeom()).toEqual([[0, 0], [1, 1], [0, 1], [0, 0]])
  })

  test('interior ring points reversed', () => {
    const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const seg2 = new Segment({ x: 1, y: 1 }, { x: 0, y: 1 })
    const seg3 = new Segment({ x: 0, y: 1 }, { x: 0, y: 0 })

    seg1.rightSE.link(seg2.rightSE)
    seg2.leftSE.link(seg3.rightSE)
    seg3.leftSE.link(seg1.leftSE)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true

    const ring = Ring.factory([seg1, seg2, seg3])[0]
    ring._cache = { isExteriorRing: false }

    expect(ring.isExteriorRing).toBeFalsy()
    expect(ring.getGeom()).toEqual([[0, 0], [0, 1], [1, 1], [0, 0]])
  })

  test('removes colinear points successfully', () => {
    const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const seg2 = new Segment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const seg3 = new Segment({ x: 2, y: 2 }, { x: 0, y: 2 })
    const seg4 = new Segment({ x: 0, y: 2 }, { x: 0, y: 0 })

    seg1.rightSE.link(seg2.leftSE)
    seg2.rightSE.link(seg3.rightSE)
    seg3.leftSE.link(seg4.rightSE)
    seg4.leftSE.link(seg1.leftSE)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true
    seg4._cache['isInResult'] = true

    const ring = Ring.factory([seg1, seg2, seg3, seg4])[0]

    expect(ring.getGeom()).toEqual([[0, 0], [2, 2], [0, 2], [0, 0]])
  })

  test('ring with all colinear points returns null', () => {
    const seg1 = new Segment({ x: 0, y: 0 }, { x: 1, y: 1 })
    const seg2 = new Segment({ x: 1, y: 1 }, { x: 2, y: 2 })
    const seg3 = new Segment({ x: 2, y: 2 }, { x: 3, y: 3 })
    const seg4 = new Segment({ x: 3, y: 3 }, { x: 0, y: 0 })

    seg1.rightSE.link(seg2.leftSE)
    seg2.rightSE.link(seg3.rightSE)
    seg3.leftSE.link(seg4.rightSE)
    seg4.leftSE.link(seg1.leftSE)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true
    seg4._cache['isInResult'] = true

    const ring = Ring.factory([seg1, seg2, seg3, seg4])[0]

    expect(ring.getGeom()).toEqual(null)
  })
})

describe('poly', () => {
  test('basic', () => {
    const ring1 = { registerPoly: jest.fn(), getGeom: () => 1 }
    const ring2 = { registerPoly: jest.fn(), getGeom: () => 2 }
    const ring3 = { registerPoly: jest.fn(), getGeom: () => 3 }

    const poly = new Poly(ring1)
    poly.addInterior(ring2)
    poly.addInterior(ring3)

    expect(ring1.registerPoly).toHaveBeenCalledWith(poly)
    expect(ring2.registerPoly).toHaveBeenCalledWith(poly)
    expect(ring3.registerPoly).toHaveBeenCalledWith(poly)

    expect(poly.getGeom()).toEqual([1, 2, 3])
  })

  test('has all colinear exterior ring', () => {
    const ring1 = { registerPoly: jest.fn(), getGeom: () => null }
    const poly = new Poly(ring1)

    expect(ring1.registerPoly).toHaveBeenCalledWith(poly)

    expect(poly.getGeom()).toEqual(null)
  })

  test('has all colinear interior ring', () => {
    const ring1 = { registerPoly: jest.fn(), getGeom: () => 1 }
    const ring2 = { registerPoly: jest.fn(), getGeom: () => null }
    const ring3 = { registerPoly: jest.fn(), getGeom: () => 3 }

    const poly = new Poly(ring1)
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
    const multipoly = new MultiPoly([])
    const poly1 = { getGeom: () => 0 }
    const poly2 = { getGeom: () => 1 }
    multipoly.polys = [poly1, poly2]

    expect(multipoly.getGeom()).toEqual([0, 1])
  })

  test('has poly with all colinear exterior ring', () => {
    const multipoly = new MultiPoly([])
    const poly1 = { getGeom: () => null }
    const poly2 = { getGeom: () => 1 }
    multipoly.polys = [poly1, poly2]

    expect(multipoly.getGeom()).toEqual([1])
  })
})
