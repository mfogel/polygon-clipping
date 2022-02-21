/* eslint-env jest */

import { RingIn, PolyIn, MultiPolyIn } from "../src/geom-in"

describe("RingIn", () => {
  test("create exterior ring", () => {
    const ringGeomIn = [
      [0, 0],
      [1, 0],
      [1, 1],
    ]
    const expectedPt1 = { x: 0, y: 0 }
    const expectedPt2 = { x: 1, y: 0 }
    const expectedPt3 = { x: 1, y: 1 }
    const poly = {}
    const ring = new RingIn(ringGeomIn, poly, true)
    poly.exteriorRing = ring

    expect(ring.poly).toBe(poly)
    expect(ring.isExterior).toBe(true)
    expect(ring.segments.length).toBe(3)
    expect(ring.getSweepEvents().length).toBe(6)

    expect(ring.segments[0].leftSE.point).toMatchObject(expectedPt1)
    expect(ring.segments[0].rightSE.point).toMatchObject(expectedPt2)
    expect(ring.segments[1].leftSE.point).toMatchObject(expectedPt2)
    expect(ring.segments[1].rightSE.point).toMatchObject(expectedPt3)
    expect(ring.segments[2].leftSE.point).toMatchObject(expectedPt1)
    expect(ring.segments[2].rightSE.point).toMatchObject(expectedPt3)
  })

  test("create an interior ring", () => {
    const ring = new RingIn(
      [
        [0, 0],
        [1, 1],
        [1, 0],
      ],
      {},
      false,
    )
    expect(ring.isExterior).toBe(false)
  })
})

describe("PolyIn", () => {
  test("creation", () => {
    const multiPoly = {}
    const poly = new PolyIn(
      [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
        ],
        [
          [0, 0],
          [1, 1],
          [1, 0],
        ],
        [
          [2, 2],
          [2, 3],
          [3, 3],
          [3, 2],
        ],
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

describe("MultiPolyIn", () => {
  test("creation with multipoly", () => {
    const multipoly = new MultiPolyIn([
      [
        [
          [0, 0],
          [1, 1],
          [0, 1],
        ],
      ],
      [
        [
          [0, 0],
          [4, 0],
          [4, 9],
        ],
        [
          [2, 2],
          [3, 3],
          [3, 2],
        ],
      ],
    ])

    expect(multipoly.polys.length).toBe(2)
    expect(multipoly.getSweepEvents().length).toBe(18)
  })

  test("creation with poly", () => {
    const multipoly = new MultiPolyIn([
      [
        [
          [0, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    ])

    expect(multipoly.polys.length).toBe(1)
    expect(multipoly.getSweepEvents().length).toBe(6)
  })

  test("third or more coordinates are ignored", () => {
    const multipoly = new MultiPolyIn([
      [
        [
          [0, 0, 42],
          [1, 1, 128],
          [0, 1, 84],
          [0, 0, 42],
        ],
      ],
    ])

    expect(multipoly.polys.length).toBe(1)
    expect(multipoly.getSweepEvents().length).toBe(6)
  })

  test("creation with invalid input", () => {
    expect(() => {
      new MultiPolyIn("not a geometry")
    }).toThrowError(/not a valid Polygon or MultiPolygon/)
  })

  test("creation with point", () => {
    expect(() => {
      new MultiPolyIn([42, 43])
    }).toThrowError(/not a valid Polygon or MultiPolygon/)
  })

  test("creation with ring", () => {
    expect(() => {
      new MultiPolyIn([
        [0, 0],
        [0, 1],
        [1, 1],
      ])
    }).toThrowError(/not a valid Polygon or MultiPolygon/)
  })

  test("creation with empty polygon / ring ", () => {
    expect(() => {
      new MultiPolyIn([[]])
    }).toThrowError(/not a valid Polygon or MultiPolygon/)
  })

  test("creation with empty ring / point ", () => {
    expect(() => {
      new MultiPolyIn([[[]]])
    }).toThrowError(/not a valid Polygon or MultiPolygon/)
  })

  test("creation with polygon with invalid coordiante", () => {
    expect(() => {
      new MultiPolyIn([
        [
          ["not a number", 0],
          [0, 1],
          [1, 1],
        ],
      ])
    }).toThrowError(/not a valid Polygon or MultiPolygon/)
  })

  test("creation with polygon with missing coordiante", () => {
    expect(() => {
      new MultiPolyIn([[[0, 0], [1], [1, 1]]])
    }).toThrowError(/not a valid Polygon or MultiPolygon/)
  })

  test("creation with multipolygon with invalid coordiante", () => {
    expect(() => {
      new MultiPolyIn([
        [
          [
            [0, 0],
            [0, 1],
            [[], 0],
          ],
        ],
      ])
    }).toThrowError(/not a valid Polygon or MultiPolygon/)
  })

  test("creation with multipolygon with missing coordiante", () => {
    expect(() => {
      new MultiPolyIn([[[[0], [0, 1], [1, 0]]]])
    }).toThrowError(/not a valid Polygon or MultiPolygon/)
  })
})
