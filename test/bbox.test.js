/* eslint-env jest */

const {
  doBboxesOverlap,
  getBbox,
  getBboxOverlap,
  getOtherCorners,
  isInBbox
} = require('../src/bbox')

describe('get bbox', () => {
  test('no points', () => {
    expect(() => getBbox()).toThrow()
  })

  test('one point', () => {
    const p1 = [3, 4]
    const bbox = [[3, 4], [3, 4]]
    expect(getBbox(p1)).toEqual(bbox)
  })

  test('two points', () => {
    const p1 = [3, 4]
    const p2 = [-4, 8]
    const bbox = [[-4, 4], [3, 8]]
    expect(getBbox(p1, p2)).toEqual(bbox)
  })

  test('three points', () => {
    const p1 = [3, 4]
    const p2 = [-4, 8]
    const p3 = [2, -3]
    const bbox = [[-4, -3], [3, 8]]
    expect(getBbox(p1, p2, p3)).toEqual(bbox)
  })
})

describe('is in bbox', () => {
  test('outside', () => {
    const bbox = [[1, 2], [5, 6]]
    expect(isInBbox(bbox, [0, 3])).toBeFalsy()
    expect(isInBbox(bbox, [3, 30])).toBeFalsy()
    expect(isInBbox(bbox, [3, -30])).toBeFalsy()
    expect(isInBbox(bbox, [9, 3])).toBeFalsy()
  })

  test('inside', () => {
    const bbox = [[1, 2], [5, 6]]
    expect(isInBbox(bbox, [1, 2])).toBeTruthy()
    expect(isInBbox(bbox, [5, 6])).toBeTruthy()
    expect(isInBbox(bbox, [1, 6])).toBeTruthy()
    expect(isInBbox(bbox, [5, 2])).toBeTruthy()
    expect(isInBbox(bbox, [3, 4])).toBeTruthy()
  })
})

describe('bbox overlap', () => {
  const b1 = [[4, 4], [6, 6]]
  describe('disjoint - none', () => {
    test('above', () => {
      const b2 = [[7, 7], [8, 8]]
      expect(doBboxesOverlap(b1, b2)).toBeFalsy()
      expect(getBboxOverlap(b1, b2)).toBeNull()
    })
    test('left', () => {
      const b2 = [[1, 5], [3, 8]]
      expect(doBboxesOverlap(b1, b2)).toBeFalsy()
      expect(getBboxOverlap(b1, b2)).toBeNull()
    })
    test('down', () => {
      const b2 = [[2, 2], [3, 3]]
      expect(doBboxesOverlap(b1, b2)).toBeFalsy()
      expect(getBboxOverlap(b1, b2)).toBeNull()
    })
    test('right', () => {
      const b2 = [[12, 1], [14, 9]]
      expect(doBboxesOverlap(b1, b2)).toBeFalsy()
      expect(getBboxOverlap(b1, b2)).toBeNull()
    })
  })

  describe('touching - one point', () => {
    test('upper right corner of 1', () => {
      const b2 = [[6, 6], [7, 8]]
      expect(doBboxesOverlap(b1, b2)).toBeTruthy()
      expect(getBboxOverlap(b1, b2)).toEqual([[6, 6], [6, 6]])
    })
    test('upper left corner of 1', () => {
      const b2 = [[3, 6], [4, 8]]
      expect(doBboxesOverlap(b1, b2)).toBeTruthy()
      expect(getBboxOverlap(b1, b2)).toEqual([[4, 6], [4, 6]])
    })
    test('lower left corner of 1', () => {
      const b2 = [[0, 0], [4, 4]]
      expect(doBboxesOverlap(b1, b2)).toBeTruthy()
      expect(getBboxOverlap(b1, b2)).toEqual([[4, 4], [4, 4]])
    })
    test('lower right corner of 1', () => {
      const b2 = [[6, 0], [12, 4]]
      expect(doBboxesOverlap(b1, b2)).toBeTruthy()
      expect(getBboxOverlap(b1, b2)).toEqual([[6, 4], [6, 4]])
    })
  })

  describe('overlapping - two points', () => {
    describe('full overlap', () => {
      test('matching bboxes', () => {
        expect(doBboxesOverlap(b1, b1)).toBeTruthy()
        expect(getBboxOverlap(b1, b1)).toEqual(b1)
      })

      test('one side & two corners matching', () => {
        const b2 = [[4, 4], [5, 6]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[4, 4], [5, 6]])
      })

      test('one corner matching, part of two sides', () => {
        const b2 = [[5, 4], [6, 5]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[5, 4], [6, 5]])
      })

      test('part of a side matching, no corners', () => {
        const b2 = [[4.5, 4.5], [5.5, 6]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[4.5, 4.5], [5.5, 6]])
      })

      test('completely enclosed - no side or corner matching', () => {
        const b2 = [[4.5, 5], [5.5, 5.5]]
        expect(getBboxOverlap(b1, b2)).toEqual(b2)
      })
    })

    describe('partial overlap', () => {
      test('full side overlap', () => {
        const b2 = [[3, 4], [5, 6]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[4, 4], [5, 6]])
      })

      test('partial side overlap', () => {
        const b2 = [[5, 4.5], [7, 5.5]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[5, 4.5], [6, 5.5]])
      })

      test('corner overlap', () => {
        const b2 = [[5, 5], [7, 7]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[5, 5], [6, 6]])
      })
    })
  })

  describe('line bboxes', () => {
    describe('vertical line & normal', () => {
      test('no overlap', () => {
        const b2 = [[7, 3], [7, 6]]
        expect(doBboxesOverlap(b1, b2)).toBeFalsy()
        expect(getBboxOverlap(b1, b2)).toBeNull()
      })
      test('point overlap', () => {
        const b2 = [[6, 0], [6, 4]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[6, 4], [6, 4]])
      })
      test('line overlap', () => {
        const b2 = [[5, 0], [5, 9]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[5, 4], [5, 6]])
      })
    })
    describe('horizontal line & normal', () => {
      test('no overlap', () => {
        const b2 = [[3, 7], [6, 7]]
        expect(doBboxesOverlap(b1, b2)).toBeFalsy()
        expect(getBboxOverlap(b1, b2)).toBeNull()
      })
      test('point overlap', () => {
        const b2 = [[1, 6], [4, 6]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[4, 6], [4, 6]])
      })
      test('line overlap', () => {
        const b2 = [[4, 6], [6, 6]]
        expect(doBboxesOverlap(b1, b2)).toBeTruthy()
        expect(getBboxOverlap(b1, b2)).toEqual([[4, 6], [6, 6]])
      })
    })
    describe('two vertical lines', () => {
      const v1 = [[4, 4], [4, 6]]
      test('no overlap', () => {
        const v2 = [[4, 7], [4, 8]]
        expect(doBboxesOverlap(v1, v2)).toBeFalsy()
        expect(getBboxOverlap(v1, v2)).toBeNull()
      })
      test('point overlap', () => {
        const v2 = [[4, 3], [4, 4]]
        expect(doBboxesOverlap(v1, v2)).toBeTruthy()
        expect(getBboxOverlap(v1, v2)).toEqual([[4, 4], [4, 4]])
      })
      test('line overlap', () => {
        const v2 = [[4, 3], [4, 5]]
        expect(doBboxesOverlap(v1, v2)).toBeTruthy()
        expect(getBboxOverlap(v1, v2)).toEqual([[4, 4], [4, 5]])
      })
    })
    describe('two horizontal lines', () => {
      const h1 = [[4, 6], [7, 6]]
      test('no overlap', () => {
        const h2 = [[4, 5], [7, 5]]
        expect(doBboxesOverlap(h1, h2)).toBeFalsy()
        expect(getBboxOverlap(h1, h2)).toBeNull()
      })
      test('point overlap', () => {
        const h2 = [[7, 6], [8, 6]]
        expect(doBboxesOverlap(h1, h2)).toBeTruthy()
        expect(getBboxOverlap(h1, h2)).toEqual([[7, 6], [7, 6]])
      })
      test('line overlap', () => {
        const h2 = [[4, 6], [7, 6]]
        expect(doBboxesOverlap(h1, h2)).toBeTruthy()
        expect(getBboxOverlap(h1, h2)).toEqual([[4, 6], [7, 6]])
      })
    })
    describe('horizonal and vertical lines', () => {
      test('no overlap', () => {
        const h1 = [[4, 6], [8, 6]]
        const v1 = [[5, 7], [5, 9]]
        expect(doBboxesOverlap(h1, v1)).toBeFalsy()
        expect(getBboxOverlap(h1, v1)).toBeNull()
      })
      test('point overlap', () => {
        const h1 = [[4, 6], [8, 6]]
        const v1 = [[5, 5], [5, 9]]
        expect(doBboxesOverlap(h1, v1)).toBeTruthy()
        expect(getBboxOverlap(h1, v1)).toEqual([[5, 6], [5, 6]])
      })
    })
  })

  describe('point bboxes', () => {
    describe('point & normal', () => {
      test('no overlap', () => {
        const p = [[2, 2], [2, 2]]
        expect(doBboxesOverlap(b1, p)).toBeFalsy()
        expect(getBboxOverlap(b1, p)).toBeNull()
      })
      test('point overlap', () => {
        const p = [[5, 5], [5, 5]]
        expect(doBboxesOverlap(b1, p)).toBeTruthy()
        expect(getBboxOverlap(b1, p)).toEqual(p)
      })
    })
    describe('point & line', () => {
      test('no overlap', () => {
        const p = [[2, 2], [2, 2]]
        const l = [[4, 6], [4, 8]]
        expect(doBboxesOverlap(l, p)).toBeFalsy()
        expect(getBboxOverlap(l, p)).toBeNull()
      })
      test('point overlap', () => {
        const p = [[5, 5], [5, 5]]
        const l = [[4, 5], [6, 5]]
        expect(doBboxesOverlap(l, p)).toBeTruthy()
        expect(getBboxOverlap(l, p)).toEqual(p)
      })
    })
    describe('point & point', () => {
      test('no overlap', () => {
        const p1 = [[2, 2], [2, 2]]
        const p2 = [[4, 6], [4, 6]]
        expect(doBboxesOverlap(p1, p2)).toBeFalsy()
        expect(getBboxOverlap(p1, p2)).toBeNull()
      })
      test('point overlap', () => {
        const p = [[5, 5], [5, 5]]
        expect(doBboxesOverlap(p, p)).toBeTruthy()
        expect(getBboxOverlap(p, p)).toEqual(p)
      })
    })
  })
})

describe('get other corners', () => {
  test('general', () => {
    const bbox = [[2, 3], [4, 5]]
    const expected = [[2, 5], [4, 3]]
    expect(getOtherCorners(bbox)).toEqual(expected)
  })

  test('horizontal', () => {
    const bbox = [[2, 3], [4, 3]]
    expect(getOtherCorners(bbox)).toEqual(bbox)
  })

  test('vertical', () => {
    const bbox = [[2, 3], [2, 5]]
    expect(getOtherCorners(bbox)).toEqual(bbox.reverse())
  })

  test('point', () => {
    const bbox = [[2, 2], [2, 2]]
    expect(getOtherCorners(bbox)).toEqual(bbox)
  })
})
