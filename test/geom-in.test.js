/* eslint-env jest */

import { RingIn, PolyIn, MultiPolyIn } from '../src/geom-in'

describe('RingIn', () => {
  test('create exterior ring', () => {
    const [pt1, pt2, pt3] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]
    const poly = {}
    const ring = new RingIn([pt1, pt2, pt3], poly, true)
    poly.exteriorRing = ring

    expect(ring.poly).toBe(poly)
    expect(ring.isExterior).toBe(true)
    expect(ring.segments.length).toBe(3)
    expect(ring.getSweepEvents().length).toBe(6)

    expect(ring.segments[0].leftSE.point).toEqual(pt1)
    expect(ring.segments[0].rightSE.point).toEqual(pt2)
    expect(ring.segments[1].leftSE.point).toEqual(pt2)
    expect(ring.segments[1].rightSE.point).toEqual(pt3)
    expect(ring.segments[2].leftSE.point).toEqual(pt1)
    expect(ring.segments[2].rightSE.point).toEqual(pt3)
  })

  test('create an interior ring', () => {
    const ring = new RingIn([{x: 0, y: 0}, {x: 1, y: 1}, {x: 1, y: 0}], {}, false)
    expect(ring.isExterior).toBe(false)
  })
})

describe('PolyIn', () => {
  test('creation', () => {
    const multiPoly = {}
    const poly = new PolyIn(
      [
        [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}, {x: 0, y: 10}],
        [{x: 0, y: 0}, {x: 1, y: 1}, {x: 1, y: 0}],
        [{x: 2, y: 2}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 3, y: 2}],
      ],
      multiPoly,
    )

    expect(poly.multiPoly).toBe(multiPoly)
    expect(poly.exteriorRing.segments.length).toBe(4)
    expect(poly.interiorRings.length).toBe(2)
    expect(poly.interiorRings[0].segments.length).toBe(3)
    expect(poly.interiorRings[1].segments.length).toBe(4)
    expect(poly.getSweepEvents().length).toBe(22)
  })
})

describe('MultiPolyIn', () => {
  test('creation', () => {
    const multipoly = new MultiPolyIn([
      [[{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]],
      [
        [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 10 }],
        [{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 2 }]
      ]
    ])

    expect(multipoly.polys.length).toBe(2)
    expect(multipoly.getSweepEvents().length).toBe(18)
  })
})
