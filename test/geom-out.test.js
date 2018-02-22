/* eslint-env jest */

// hard to unit test these structures as much of what they
// do is operate off of the result of the sweep line sweep

const Segment = require('../src/segment')
const { Ring, Poly, MultiPoly } = require('../src/geom-out')

describe('ring', () => {
  test('basic', () => {
    const seg = new Segment([0, 0], [1, 1])
    const ring = new Ring(seg)

    expect(ring.geom).toEqual([[0, 0], [1, 1]])
    expect(ring.enclosingRing).toBeNull()
    expect(ring.isExteriorRing).toBeTruthy()
  })

  test('removes superfluous points', () => {
    const seg = new Segment([0, 0], [1, 1])
    const ring = new Ring(seg)
    ring._points.push([2, 2])
    ring._points.push([3, 3])

    expect(ring.geom).toEqual([[0, 0], [3, 3]])
  })
})

describe('poly', () => {
  test('basic', () => {
    const pts1 = [[1, 2], [3, 4]]
    const pts2 = [[5, 6], [7, 8]]
    const pts3 = [[9, 10], [11, 12]]
    const ring1 = new Ring(new Segment(...pts1))
    const ring2 = new Ring(new Segment(...pts2))
    const ring3 = new Ring(new Segment(...pts3))

    const poly = new Poly(ring1)
    poly.addInterior(ring2)
    poly.addInterior(ring3)

    expect(poly.geom).toEqual([pts1, pts2, pts3])
  })
})

describe('multipoly', () => {
  test('basic', () => {
    const pts1 = [[1, 2], [3, 4]]
    const pts2 = [[5, 6], [7, 8]]
    const pts3 = [[9, 10], [11, 12]]
    const ring1 = new Ring(new Segment(...pts1))
    const ring2 = new Ring(new Segment(...pts2))
    const ring3 = new Ring(new Segment(...pts3))

    const multipoly = new MultiPoly([ring1, ring2, ring3])
    expect(multipoly.geom).toEqual([[pts1], [pts2], [pts3]])
  })
})
