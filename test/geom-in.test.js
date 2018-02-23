/* eslint-env jest */

const { Ring, Poly, MultiPoly } = require('../src/geom-in')

describe('Ring', () => {
  test('create exterior', () => {
    const polyMock = { setExteriorRing: jest.fn(), addInteriorRing: jest.fn() }
    const ring = new Ring(polyMock, true)

    expect(ring.isExterior).toBeTruthy()
    expect(ring.isInterior).toBeFalsy()
    expect(polyMock.setExteriorRing).toHaveBeenCalledTimes(1)
    expect(polyMock.setExteriorRing).toHaveBeenCalledWith(ring)
    expect(polyMock.addInteriorRing).not.toHaveBeenCalled()
  })

  test('create interior', () => {
    const polyMock = { setExteriorRing: jest.fn(), addInteriorRing: jest.fn() }
    const ring = new Ring(polyMock, false)

    expect(ring.isExterior).toBeFalsy()
    expect(ring.isInterior).toBeTruthy()
    expect(polyMock.setExteriorRing).not.toHaveBeenCalled()
    expect(polyMock.addInteriorRing).toHaveBeenCalledTimes(1)
    expect(polyMock.addInteriorRing).toHaveBeenCalledWith(ring)
  })

  test('ring Id increments', () => {
    const polyMock = { setExteriorRing: jest.fn(), addInteriorRing: jest.fn() }
    const ring1 = new Ring(polyMock, false)
    const ring2 = new Ring(polyMock, false)

    expect(ring2.id - ring1.id).toBe(1)
  })

  describe('is valid? ', () => {
    const poly = new Poly({ addPoly: jest.fn() })
    const exteriorRing = new Ring(poly, true)
    const interiorRing1 = new Ring(poly, false)
    const interiorRing2 = new Ring(poly, false)

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
    const multiPolyMock = { addPoly: jest.fn() }
    const poly = new Poly(multiPolyMock)

    expect(poly.exteriorRing).toBeNull()
    expect(poly.interiorRings).toEqual([])
    expect(multiPolyMock.addPoly).toHaveBeenCalledTimes(1)
    expect(multiPolyMock.addPoly).toHaveBeenCalledWith(poly)
  })

  test('set exterior ring', () => {
    const poly = new Poly({ addPoly: jest.fn() })
    const ring = {}

    poly.setExteriorRing(ring)
    expect(poly.exteriorRing).toBe(ring)
  })

  test('add interior ring', () => {
    const poly = new Poly({ addPoly: jest.fn() })
    const ring = {}

    poly.addInteriorRing(ring)
    expect(poly.interiorRings.length).toBe(1)
    expect(poly.interiorRings[0]).toBe(ring)
  })

  describe('is inside? ', () => {
    const poly = new Poly({ addPoly: jest.fn() })
    const exteriorRing = new Ring(poly, true)
    const interiorRing1 = new Ring(poly, false)
    const interiorRing2 = new Ring(poly, false)

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
    const multipoly = new MultiPoly()

    expect(multipoly.polys).toEqual([])
  })

  test('add poly', () => {
    const multipoly = new MultiPoly()
    const poly = {}

    multipoly.addPoly(poly)
    expect(multipoly.polys.length).toBe(1)
    expect(multipoly.polys[0]).toBe(poly)
  })
})
