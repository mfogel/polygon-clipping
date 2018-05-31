/* eslint-env jest */

import {
  cleanRing,
  cleanMultiPoly,
  forceMultiPoly,
  pointsAsObjects
} from '../src/clean-input'

const deepCopyArray = input => {
  if (Array.isArray(input)) return input.map(deepCopyArray)
  else return input
}

describe('forceMultiPoly()', () => {
  test('throws error on non-array input', () => {
    expect(() => forceMultiPoly(4)).toThrow()
    expect(() => forceMultiPoly('4')).toThrow()
    expect(() => forceMultiPoly(null)).toThrow()
    expect(() => forceMultiPoly(undefined)).toThrow()
    expect(() => forceMultiPoly({})).toThrow()
  })

  test('throws error on point input', () => {
    const point = { x: 3, y: 4 }
    expect(() => forceMultiPoly(point)).toThrow()
  })

  test('throws error on ring input', () => {
    const ring = [
      { x: 3, y: 4 },
      { x: 4, y: 5 },
      { x: 5, y: 6 },
      { x: 3, y: 4 }
    ]
    expect(() => forceMultiPoly(ring)).toThrow()
  })

  test('throws error numbers too deep input', () => {
    // multipolygons are 4 deep, anything more than that is not valid
    const invalidGeom = [[[[{ x: 4, y: 5 }]]]]
    expect(() => forceMultiPoly(invalidGeom)).toThrow()
  })

  test('converts polygon to multipolygon', () => {
    const poly = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
    ]
    const expected = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    forceMultiPoly(poly)
    expect(poly).toEqual(expected)
  })

  test('multipoly input unchanged', () => {
    const poly = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    const expected = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    forceMultiPoly(poly)
    expect(poly).toEqual(expected)
  })

  test('empty multipoly input unchanged', () => {
    const poly = []
    const expected = []
    forceMultiPoly(poly)
    expect(poly).toEqual(expected)
  })
})

describe('cleanMultiPoly()', () => {
  test('adds closing elements to rings', () => {
    const openRings = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]],
      [
        [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
      ]
    ]
    const closedRings = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]],
      [
        [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 0, y: 0 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
      ]
    ]
    cleanMultiPoly(openRings)
    expect(openRings).toEqual(closedRings)
  })

  test('already standardized input unchanged', () => {
    const allGood = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]],
      [
        [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 0, y: 0 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
      ]
    ]
    const stillAllGood = deepCopyArray(allGood)
    cleanMultiPoly(allGood)
    expect(allGood).toEqual(stillAllGood)
  })

  test('empty multipoly unchanged', () => {
    const allGood = []
    const stillAllGood = deepCopyArray(allGood)
    cleanMultiPoly(allGood)
    expect(allGood).toEqual(stillAllGood)
  })

  test('interior degenerate rings removed', () => {
    const mpIn = [
      [
        [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }, { x: 0, y: 0 }],
        [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 0 }]
      ]
    ]
    const mpExpected = [
      [[{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }, { x: 0, y: 0 }]]
    ]
    cleanMultiPoly(mpIn)
    expect(mpIn).toEqual(mpExpected)
  })

  test('exterior degenerate ring removes polygon', () => {
    const mpIn = [
      [
        [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 0 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
      ]
    ]
    cleanMultiPoly(mpIn)
    expect(mpIn).toEqual([])
  })

  test('exterior empty ring removes polygon', () => {
    const mpIn = [[[]]]
    cleanMultiPoly(mpIn)
    expect(mpIn).toEqual([])
  })

  test('polygon with no rings removed', () => {
    const mpIn = [[]]
    cleanMultiPoly(mpIn)
    expect(mpIn).toEqual([])
  })
})

describe('cleanRing()', () => {
  test('already standardized input unchanged', () => {
    const allGood = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 0 }
    ]
    const stillAllGood = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 0 }
    ]
    cleanRing(allGood)
    expect(allGood).toEqual(stillAllGood)
  })

  test('adds closing elements to rings', () => {
    const openRing = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
    const closedRing = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 0 }
    ]
    cleanRing(openRing)
    expect(openRing).toEqual(closedRing)
  })

  test('removes duplicate points', () => {
    const ringBad = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 }
    ]
    const ringGood = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 0 }
    ]
    cleanRing(ringBad)
    expect(ringBad).toEqual(ringGood)
  })

  test('removes colinear points', () => {
    const ringBad = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 2 },
      { x: 0, y: 1 },
      { x: 0, y: 0 }
    ]
    const ringGood = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 2 },
      { x: 0, y: 0 }
    ]
    cleanRing(ringBad)
    expect(ringBad).toEqual(ringGood)
  })

  test('removes first/last when colinear', () => {
    const ringBad = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 0, y: 0 }
    ]
    const ringGood = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ]
    cleanRing(ringBad)
    expect(ringBad).toEqual(ringGood)
  })

  test('degenerate ring shrinks to empty array', () => {
    const ringBad = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ]
    cleanRing(ringBad)
    expect(ringBad).toEqual([])
  })
})

describe('pointsAsObjects()', () => {
  test('basic poly', () => {
    const input = [[[0, 0], [1, 0], [0, 1], [0, 0]]]
    const expected = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
    ]
    expect(pointsAsObjects(input)).toEqual(expected)
  })

  test('basic multipoly', () => {
    const input = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const expected = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    expect(pointsAsObjects(input)).toEqual(expected)
  })

  test('too shallow', () => {
    const input = [[0, 0], [1, 0], [0, 1], [0, 0]]
    expect(() => pointsAsObjects(input)).toThrow()
  })

  test('way too shallow', () => {
    const input = [0, 0]
    expect(() => pointsAsObjects(input)).toThrow()
  })

  test('wrong type', () => {
    const input = 0
    expect(() => pointsAsObjects(input)).toThrow()
  })

  test('too deep', () => {
    const input = [[[[[0, 0], [1, 0], [0, 1], [0, 0]]]]]
    expect(() => pointsAsObjects(input)).toThrow()
  })
})
