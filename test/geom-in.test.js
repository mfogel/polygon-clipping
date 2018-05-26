/* eslint-env jest */

import { Ring, Poly, MultiPoly } from '../src/geom-in'

describe('Ring', () => {
  test('create exterior ring', () => {
    const [pt1, pt2, pt3, pt4] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 0 }
    ]
    const poly = {}
    const ring = new Ring([pt1, pt2, pt3, pt4], poly)
    poly.exteriorRing = ring

    expect(ring.poly).toBe(poly)
    expect(ring.isExterior).toBeTruthy()
    expect(ring.isInterior).toBeFalsy()
    expect(ring.segments.length).toBe(3)
    expect(ring.getSweepEvents().length).toBe(6)

    expect(ring.segments[0].leftSE.point).toEqual(pt1)
    expect(ring.segments[0].rightSE.point).toEqual(pt2)
    expect(ring.segments[1].leftSE.point).toEqual(pt2)
    expect(ring.segments[1].rightSE.point).toEqual(pt3)
    expect(ring.segments[2].leftSE.point).toEqual(pt4)
    expect(ring.segments[2].rightSE.point).toEqual(pt3)
  })

  test('create an interior ring', () => {
    const ring = new Ring([], {})
    expect(ring.isExterior).toBeFalsy()
    expect(ring.isInterior).toBeTruthy()
  })

  test('ring Id increments', () => {
    const ring1 = new Ring([])
    const ring2 = new Ring([])
    expect(ring2.id - ring1.id).toBe(1)
  })

  describe('is valid? ', () => {
    const poly = new Poly([[], [], []])
    const exteriorRing = poly.exteriorRing
    const interiorRing1 = poly.interiorRings[0]
    const interiorRing2 = poly.interiorRings[1]

    describe('yup', () => {
      test('exterior, no funny stuff', () => {
        const ring = exteriorRing
        const sameSLER = [exteriorRing]
        const diffSLER = []
        const insideOf = []
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeTruthy()
      })

      test('exterior, coincident w/an interior with diff SWE', () => {
        const ring = exteriorRing
        const sameSLER = [exteriorRing]
        const diffSLER = [interiorRing1]
        const insideOf = []
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeTruthy()
      })

      test('interior, no funny stuff', () => {
        const ring = interiorRing1
        const sameSLER = [interiorRing1]
        const diffSLER = []
        const insideOf = [exteriorRing]
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeTruthy()
      })

      test('interior, coincident w/exterior with diff SWE', () => {
        const ring = interiorRing1
        const sameSLER = [interiorRing1]
        const diffSLER = [exteriorRing]
        const insideOf = []
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeTruthy()
      })

      test('interior, coincident w/another interior same SWE', () => {
        const ring = interiorRing1
        const sameSLER = [interiorRing1, interiorRing2]
        const diffSLER = []
        const insideOf = [exteriorRing]
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeTruthy()
      })
    })

    describe('nope', () => {
      test('exterior, within an interior', () => {
        const ring = exteriorRing
        const sameSLER = [exteriorRing]
        const diffSLER = []
        const insideOf = [interiorRing1]
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeFalsy()
      })

      test('exterior, coincident w/an interior with same SWE', () => {
        const ring = exteriorRing
        const sameSLER = [exteriorRing, interiorRing1]
        const diffSLER = []
        const insideOf = []
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeFalsy()
      })

      test('interior, outside exterior', () => {
        const ring = interiorRing1
        const sameSLER = [interiorRing1]
        const diffSLER = []
        const insideOf = []
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeFalsy()
      })

      test('interior, coincident w/exterior with same SWE', () => {
        const ring = interiorRing1
        const sameSLER = [interiorRing1, exteriorRing]
        const diffSLER = []
        const insideOf = []
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeFalsy()
      })

      test('interior, inside another interior', () => {
        const ring = interiorRing1
        const sameSLER = [interiorRing1]
        const diffSLER = []
        const insideOf = [exteriorRing, interiorRing2]
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeFalsy()
      })

      test('interior, coincident w/another interior with diff SWE', () => {
        const ring = interiorRing1
        const sameSLER = [interiorRing1]
        const diffSLER = [interiorRing2]
        const insideOf = [exteriorRing]
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeFalsy()
      })

      test('interior, coincident w/another interior same SWE, outside exterior', () => {
        const ring = interiorRing1
        const sameSLER = [interiorRing1, interiorRing2]
        const diffSLER = []
        const insideOf = []
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeFalsy()
      })

      test('interior, coincident w/same SWE another interior and exterior', () => {
        const ring = interiorRing1
        const sameSLER = [interiorRing1, interiorRing2, exteriorRing]
        const diffSLER = []
        const insideOf = []
        expect(ring.isValid(sameSLER, diffSLER, insideOf)).toBeFalsy()
      })
    })
  })
})

describe('Poly', () => {
  test('creation', () => {
    const multiPoly = {}
    const poly = new Poly(
      [
        [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        [{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }],
        [{ x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 7 }]
      ],
      multiPoly
    )

    expect(poly.multiPoly).toBe(multiPoly)
    expect(poly.exteriorRing.segments.length).toBe(1)
    expect(poly.interiorRings.length).toBe(2)
    expect(poly.interiorRings[0].segments.length).toBe(2)
    expect(poly.interiorRings[1].segments.length).toBe(3)
    expect(poly.getSweepEvents().length).toBe(12)
  })

  describe('is inside? ', () => {
    const poly = new Poly([[], [], []])
    const exteriorRing = poly.exteriorRing
    const interiorRing1 = poly.interiorRings[0]
    const interiorRing2 = poly.interiorRings[1]

    describe('yup', () => {
      test('between exterior and interior', () => {
        const insideOf = [exteriorRing]
        const onEdgeOf = []
        expect(poly.isInside(onEdgeOf, insideOf)).toBeTruthy()
      })
    })

    describe('nope', () => {
      test('on interior boundary', () => {
        const insideOf = [exteriorRing]
        const onEdgeOf = [interiorRing1]
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })

      test('on interior boundary with overlapping interiors', () => {
        const insideOf = [exteriorRing]
        const onEdgeOf = [interiorRing1, interiorRing2]
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })

      test('on exterior boundary', () => {
        const insideOf = []
        const onEdgeOf = [exteriorRing]
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })

      test('no rings at all', () => {
        const insideOf = []
        const onEdgeOf = []
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })

      test('on an interior outside the exterior', () => {
        const insideOf = []
        const onEdgeOf = [interiorRing1]
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })

      test('within an interior outside the exterior, still outside exterior', () => {
        const insideOf = [interiorRing1]
        const onEdgeOf = []
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })

      test('on the exterior, within an interior that goes out of the exterior', () => {
        const insideOf = [interiorRing1]
        const onEdgeOf = [exteriorRing]
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })

      test('on an interior that overlaps with exterior', () => {
        const insideOf = []
        const onEdgeOf = [exteriorRing, interiorRing1]
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })

      test('on an interior that overlaps with exterior *and* and interior', () => {
        const insideOf = []
        const onEdgeOf = [exteriorRing, interiorRing1, interiorRing2]
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })

      test('inside both the exterior and an interior', () => {
        const insideOf = [exteriorRing, interiorRing1]
        const onEdgeOf = []
        expect(poly.isInside(onEdgeOf, insideOf)).toBeFalsy()
      })
    })
  })
})

describe('MultiPoly', () => {
  test('creation', () => {
    const multipoly = new MultiPoly([
      [[{ x: 0, y: 0 }, { x: 1, y: 1 }]],
      [
        [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        [{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }]
      ]
    ])

    expect(multipoly.polys.length).toBe(2)
    expect(multipoly.getSweepEvents().length).toBe(8)
  })
})
