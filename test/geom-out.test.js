/* eslint-env jest */

// hard to unit test these structures as much of what they
// do is operate off of the result of the sweep line sweep

const Segment = require('../src/segment')
const { Ring, Poly, MultiPoly } = require('../src/geom-out')

describe('ring', () => {
  test('exterior ring', () => {
    const seg1 = new Segment([0, 0], [1, 1])
    const seg2 = new Segment([1, 1], [0, 1])
    const seg3 = new Segment([0, 1], [0, 0])

    seg1.rightSE.link(seg2.rightSE)
    seg2.leftSE.link(seg3.rightSE)
    seg3.leftSE.link(seg1.leftSE)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true

    const ring = new Ring(seg1)

    expect(ring.enclosingRing).toBeNull()
    expect(ring.isExteriorRing).toBeTruthy()
    expect(ring.getGeom()).toEqual([[0, 0], [1, 1], [0, 1], [0, 0]])
  })

  test('interior ring points reversed', () => {
    const seg1 = new Segment([0, 0], [1, 1])
    const seg2 = new Segment([1, 1], [0, 1])
    const seg3 = new Segment([0, 1], [0, 0])

    seg1.rightSE.link(seg2.rightSE)
    seg2.leftSE.link(seg3.rightSE)
    seg3.leftSE.link(seg1.leftSE)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true

    const ring = new Ring(seg1)
    ring._cache = { isExteriorRing: false }

    expect(ring.isExteriorRing).toBeFalsy()
    expect(ring.getGeom()).toEqual([[0, 0], [0, 1], [1, 1], [0, 0]])
  })

  test('removes colinear points successfully', () => {
    const seg1 = new Segment([0, 0], [1, 1])
    const seg2 = new Segment([1, 1], [2, 2])
    const seg3 = new Segment([2, 2], [0, 2])
    const seg4 = new Segment([0, 2], [0, 0])

    seg1.rightSE.link(seg2.leftSE)
    seg2.rightSE.link(seg3.rightSE)
    seg3.leftSE.link(seg4.rightSE)
    seg4.leftSE.link(seg1.leftSE)

    seg1._cache['isInResult'] = true
    seg2._cache['isInResult'] = true
    seg3._cache['isInResult'] = true
    seg4._cache['isInResult'] = true

    const ring = new Ring(seg1)

    expect(ring.getGeom()).toEqual([[0, 0], [2, 2], [0, 2], [0, 0]])
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
})

describe('multipoly', () => {
  test('basic', () => {
    const multipoly = new MultiPoly([])
    const poly1 = { getGeom: () => 0 }
    const poly2 = { getGeom: () => 1 }
    multipoly.polys = [poly1, poly2]

    expect(multipoly.getGeom()).toEqual([0, 1])
  })
})
