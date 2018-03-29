/* eslint-env jest */

const operation = require('../src/operation')
const {
  handleEmptyInputs,
  cleanRing,
  cleanMultiPoly,
  forceMultiPoly
} = require('../src/clean-input')

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
    const point = [3, 4]
    expect(() => forceMultiPoly(point)).toThrow()
  })

  test('throws error on ring input', () => {
    const ring = [[3, 4], [4, 5], [5, 6], [3, 4]]
    expect(() => forceMultiPoly(ring)).toThrow()
  })

  test('throws error numbers too deep input', () => {
    // multipolygons are 4 deep, anything more than that is not valid
    const invalidGeom = [[[[[4, 5]]]]]
    expect(() => forceMultiPoly(invalidGeom)).toThrow()
  })

  test('converts polygon to multipolygon', () => {
    const poly = [[[0, 0], [1, 0], [0, 1], [0, 0]]]
    const expected = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    forceMultiPoly(poly)
    expect(poly).toEqual(expected)
  })

  test('multipoly input unchanged', () => {
    const poly = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const expected = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
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
      [[[0, 0], [1, 0], [0, 1]]],
      [[[0, 0], [2, 0], [0, 2]], [[0, 0], [1, 0], [0, 1]]]
    ]
    const closedRings = [
      [[[0, 0], [1, 0], [0, 1], [0, 0]]],
      [[[0, 0], [2, 0], [0, 2], [0, 0]], [[0, 0], [1, 0], [0, 1], [0, 0]]]
    ]
    cleanMultiPoly(openRings)
    expect(openRings).toEqual(closedRings)
  })

  test('already standardized input unchanged', () => {
    const allGood = [
      [[[0, 0], [1, 0], [0, 1], [0, 0]]],
      [[[0, 0], [2, 0], [0, 2], [0, 0]], [[0, 0], [1, 0], [0, 1], [0, 0]]]
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
      [[[0, 0], [4, 0], [0, 4], [0, 0]], [[0, 0], [1, 1], [1, 1], [0, 0]]]
    ]
    const mpExpected = [[[[0, 0], [4, 0], [0, 4], [0, 0]]]]
    cleanMultiPoly(mpIn)
    expect(mpIn).toEqual(mpExpected)
  })

  test('exterior degenerate ring removes polygon', () => {
    const mpIn = [
      [[[0, 0], [4, 0], [4, 0], [0, 0]], [[0, 0], [1, 0], [0, 1], [0, 0]]]
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
    const allGood = [[0, 0], [1, 0], [0, 1], [0, 0]]
    const stillAllGood = deepCopyArray(allGood)
    cleanRing(allGood)
    expect(allGood).toEqual(stillAllGood)
  })

  test('adds closing elements to rings', () => {
    const openRing = [[0, 0], [1, 0], [0, 1]]
    const closedRing = [[0, 0], [1, 0], [0, 1], [0, 0]]
    cleanRing(openRing)
    expect(openRing).toEqual(closedRing)
  })

  test('removes duplicate points', () => {
    const ringBad = [[0, 0], [1, 0], [1, 0], [1, 0], [0, 1], [0, 1], [0, 0]]
    const ringGood = [[0, 0], [1, 0], [0, 1], [0, 0]]
    cleanRing(ringBad)
    expect(ringBad).toEqual(ringGood)
  })

  test('removes colinear points', () => {
    const ringBad = [[0, 0], [1, 0], [2, 0], [1, 0], [0, 2], [0, 1], [0, 0]]
    const ringGood = [[0, 0], [1, 0], [0, 2], [0, 0]]
    cleanRing(ringBad)
    expect(ringBad).toEqual(ringGood)
  })

  test('removes first/last when colinear', () => {
    const ringBad = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, 0]]
    const ringGood = [[1, 0], [0, 1], [-1, 0], [1, 0]]
    cleanRing(ringBad)
    expect(ringBad).toEqual(ringGood)
  })

  test('degenerate ring shrinks to empty array', () => {
    const ringBad = [[0, 0], [1, 0], [1, 0], [0, 0], [0, 0]]
    cleanRing(ringBad)
    expect(ringBad).toEqual([])
  })
})

describe('handleEmptyInputs()', () => {
  const emptyGeom = []
  const nonEmptyGeom = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]

  describe('none are empty', () => {
    test('intersection', () => {
      const geoms = [nonEmptyGeom, nonEmptyGeom, nonEmptyGeom]
      const opType = operation.types.INTERSECTION
      expect(handleEmptyInputs(geoms, opType)).toBe(false)
      expect(geoms).toEqual([nonEmptyGeom, nonEmptyGeom, nonEmptyGeom])
    })

    test('union', () => {
      const geoms = [nonEmptyGeom, nonEmptyGeom, nonEmptyGeom]
      const opType = operation.types.UNION
      expect(handleEmptyInputs(geoms, opType)).toBe(false)
      expect(geoms).toEqual([nonEmptyGeom, nonEmptyGeom, nonEmptyGeom])
    })

    test('xor', () => {
      const geoms = [nonEmptyGeom, nonEmptyGeom, nonEmptyGeom]
      const opType = operation.types.XOR
      expect(handleEmptyInputs(geoms, opType)).toBe(false)
      expect(geoms).toEqual([nonEmptyGeom, nonEmptyGeom, nonEmptyGeom])
    })

    test('difference', () => {
      const geoms = [nonEmptyGeom, nonEmptyGeom, nonEmptyGeom]
      const opType = operation.types.DIFFERENCE
      expect(handleEmptyInputs(geoms, opType)).toBe(false)
      expect(geoms).toEqual([nonEmptyGeom, nonEmptyGeom, nonEmptyGeom])
    })
  })

  describe('non-subject is empty', () => {
    test('intersection', () => {
      const geoms = [nonEmptyGeom, emptyGeom, nonEmptyGeom]
      const opType = operation.types.INTERSECTION
      expect(handleEmptyInputs(geoms, opType)).toBe(true)
    })

    test('union', () => {
      const geoms = [nonEmptyGeom, emptyGeom, nonEmptyGeom]
      const opType = operation.types.UNION
      expect(handleEmptyInputs(geoms, opType)).toBe(false)
      expect(geoms).toEqual([nonEmptyGeom, nonEmptyGeom])
    })

    test('xor', () => {
      const geoms = [nonEmptyGeom, emptyGeom, nonEmptyGeom]
      const opType = operation.types.XOR
      expect(handleEmptyInputs(geoms, opType)).toBe(false)
      expect(geoms).toEqual([nonEmptyGeom, nonEmptyGeom])
    })

    test('difference', () => {
      const geoms = [nonEmptyGeom, emptyGeom, nonEmptyGeom]
      const opType = operation.types.DIFFERENCE
      expect(handleEmptyInputs(geoms, opType)).toBe(false)
      expect(geoms).toEqual([nonEmptyGeom, nonEmptyGeom])
    })
  })

  describe('subject is empty', () => {
    test('intersection', () => {
      const geoms = [emptyGeom, nonEmptyGeom, nonEmptyGeom]
      const opType = operation.types.INTERSECTION
      expect(handleEmptyInputs(geoms, opType)).toBe(true)
    })

    test('union', () => {
      const geoms = [emptyGeom, nonEmptyGeom, nonEmptyGeom]
      const opType = operation.types.UNION
      expect(handleEmptyInputs(geoms, opType)).toBe(false)
      expect(geoms).toEqual([nonEmptyGeom, nonEmptyGeom])
    })

    test('xor', () => {
      const geoms = [emptyGeom, nonEmptyGeom, nonEmptyGeom]
      const opType = operation.types.XOR
      expect(handleEmptyInputs(geoms, opType)).toBe(false)
      expect(geoms).toEqual([nonEmptyGeom, nonEmptyGeom])
    })

    test('difference', () => {
      const geoms = [emptyGeom, nonEmptyGeom, nonEmptyGeom]
      const opType = operation.types.DIFFERENCE
      expect(handleEmptyInputs(geoms, opType)).toBe(true)
    })
  })
})
