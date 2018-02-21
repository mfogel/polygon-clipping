/* eslint-env jest */

const { Ring, Poly, MultiPoly } = require('../src/geom-in')

describe('Ring', () => {
  test('create exterior', () => {
    const polyMock = { setExteriorRing: jest.fn(), addInteriorRing: jest.fn() }
    const ring = new Ring(polyMock, true)

    expect(ring.isExterior).toBeTruthy()
    expect(polyMock.setExteriorRing).toHaveBeenCalledTimes(1)
    expect(polyMock.setExteriorRing).toHaveBeenCalledWith(ring)
    expect(polyMock.addInteriorRing).not.toHaveBeenCalled()
  })

  test('create interior', () => {
    const polyMock = { setExteriorRing: jest.fn(), addInteriorRing: jest.fn() }
    const ring = new Ring(polyMock, false)

    expect(ring.isExterior).toBeFalsy()
    expect(polyMock.setExteriorRing).not.toHaveBeenCalled()
    expect(polyMock.addInteriorRing).toHaveBeenCalledTimes(1)
    expect(polyMock.addInteriorRing).toHaveBeenCalledWith(ring)
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

    test('yup', () => {
      expect(poly.isInside([exteriorRing])).toBeTruthy()
    })

    describe('nope', () => {
      test('no rings at all', () => {
        expect(poly.isInside([])).toBeFalsy()
      })
      test('inside exterior and interior', () => {
        expect(poly.isInside([exteriorRing, interiorRing2])).toBeFalsy()
      })
      test('inside overlapping interiors', () => {
        expect(poly.isInside([interiorRing1, interiorRing2])).toBeFalsy()
      })
      test('inside an interior but not exterior', () => {
        expect(poly.isInside([interiorRing1])).toBeFalsy()
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
