/* eslint-env jest */

// hard to unit test these structures as much of what they
// do is operate off of the result of the sweep line sweep

const Segment = require('../src/segment')
const { Ring, Poly, MultiPoly } = require('../src/geom-out')

describe('ring', () => {
  test('exterior ring', () => {
    const seg = new Segment([0, 0], [1, 1])
    const ring = new Ring(seg)
    ring._points.push([1, 0])
    ring._points.push([0, 0])

    expect(ring.enclosingRing).toBeNull()
    expect(ring.isExteriorRing).toBeTruthy()
    expect(ring.getGeom()).toEqual([[0, 0], [1, 1], [1, 0], [0, 0]])
  })

  test('interior ring points reversed', () => {
    const seg = new Segment([0, 0], [1, 1])
    const ring = new Ring(seg)
    ring._cache = { isExteriorRing: false }
    ring._points.push([1, 0])
    ring._points.push([0, 0])

    expect(ring.isExteriorRing).toBeFalsy()
    expect(ring.getGeom()).toEqual([[0, 0], [1, 0], [1, 1], [0, 0]])
  })

  test('removes colinear points successfully', () => {
    const seg = new Segment([0, 0], [1, 1])
    const ring = new Ring(seg)
    ring._points.push([2, 2])
    ring._points.push([3, 3])
    ring._points.push([0, 3])
    ring._points.push([0, 0])

    expect(ring.getGeom()).toEqual([[0, 0], [3, 3], [0, 3], [0, 0]])
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
