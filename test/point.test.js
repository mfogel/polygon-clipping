/* eslint-env jest */

const {
  arePointsColinear,
  arePointsEqual,
  areVectorsParallel,
  comparePoints,
  crossProduct,
  doBboxesOverlap,
  dotProduct,
  getBbox,
  getBboxOverlap,
  isInBbox
} = require('../src/point')

describe('compare points', () => {
  test('earlier X coord', () => expect(comparePoints([-1, 1], [0, 0])).toBe(-1))
  test('later X coord', () => expect(comparePoints([1, 0], [0, 1])).toBe(1))
  test('earlier Y coord', () => expect(comparePoints([0, -1], [0, 0])).toBe(-1))
  test('later Y coord', () => expect(comparePoints([0, 1], [0, 0])).toBe(1))
  test('equal coord', () => expect(comparePoints([1, 1], [1, 1])).toBe(0))
})

describe('are points equal', () => {
  test('yes', () => expect(arePointsEqual([0, 0], [0.0, 0, 0])).toBeTruthy())
  test('no', () => expect(arePointsEqual([0, 0], [1, 0])).toBeFalsy())
})

describe('cross product', () => {
  test('general ', () => expect(crossProduct([1, 2], [3, 4])).toEqual(-2))
})

describe('dot product', () => {
  test('general ', () => expect(dotProduct([1, 2], [3, 4])).toEqual(11))
})

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
    expect(isInBbox([0, 3], bbox)).toBeFalsy()
    expect(isInBbox([3, 30], bbox)).toBeFalsy()
    expect(isInBbox([3, -30], bbox)).toBeFalsy()
    expect(isInBbox([9, 3], bbox)).toBeFalsy()
  })

  test('inside', () => {
    const bbox = [[1, 2], [5, 6]]
    expect(isInBbox([1, 2], bbox)).toBeTruthy()
    expect(isInBbox([5, 6], bbox)).toBeTruthy()
    expect(isInBbox([1, 6], bbox)).toBeTruthy()
    expect(isInBbox([5, 2], bbox)).toBeTruthy()
    expect(isInBbox([3, 4], bbox)).toBeTruthy()
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

describe('are vectors parallel', () => {
  describe('yes', () => {
    test('general', () => {
      const v1 = [1, 1]
      const v2 = [2, 2]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('reverse direction', () => {
      const v1 = [1, 1]
      const v2 = [-2, -2]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('horizontal', () => {
      const v1 = [1, 0]
      const v2 = [-2, 0]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('vertical', () => {
      const v1 = [0, 1]
      const v2 = [0, 2.23423]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('null vector', () => {
      // null vector is parallel to everything
      const v1 = [0, 1]
      const v2 = [0, 0]
      expect(areVectorsParallel(v1, v2)).toBeTruthy()
    })
    test('null vector with itself', () => {
      const v1 = [0, 0]
      expect(areVectorsParallel(v1, v1)).toBeTruthy()
    })
  })
  describe('no', () => {
    test('general', () => {
      const v1 = [1, 1]
      const v2 = [2, 4]
      expect(areVectorsParallel(v1, v2)).toBeFalsy()
    })
    test('perpendicular', () => {
      const v1 = [0, 1]
      const v2 = [0.5, 0]
      expect(areVectorsParallel(v1, v2)).toBeFalsy()
    })
  })
})

describe('are points colinear', () => {
  test('not enough points', () => {
    expect(arePointsColinear()).toBeTruthy()
    expect(arePointsColinear([0, 0])).toBeTruthy()
    expect(arePointsColinear([0, 0], [3, 4])).toBeTruthy()
  })
  describe('yes 3', () => {
    test('general', () => {
      expect(arePointsColinear([0, 0], [1, 1], [2, 2])).toBeTruthy()
      expect(arePointsColinear([-1, -1], [0, 0], [2, 2])).toBeTruthy()
      expect(arePointsColinear([-1, 0], [5, -6], [0, -1])).toBeTruthy()
    })
    test('repeated point', () => {
      expect(arePointsColinear([0, 0], [0, 0], [2, 2])).toBeTruthy()
      expect(arePointsColinear([1, 1], [1, 1], [1, 1])).toBeTruthy()
    })
    test('horizontal', () => {
      expect(arePointsColinear([-42.1, 0], [0, 0], [7, 0])).toBeTruthy()
    })
    test('vertical', () => {
      expect(arePointsColinear([0, -42.1], [0, 0], [0, 2])).toBeTruthy()
    })
  })
  describe('no 3', () => {
    test('general', () => {
      expect(arePointsColinear([0, 0], [-2, 1], [1, 8])).toBeFalsy()
    })
    test('perpendicular', () => {
      expect(arePointsColinear([0, 0], [0, 1], [1, 0])).toBeFalsy()
    })
  })
  describe('yes 4', () => {
    test('general', () => {
      expect(arePointsColinear([0, 0], [1, 1], [2, 2], [5, 5])).toBeTruthy()
      expect(arePointsColinear([-1, -1], [0, 0], [2, 2], [-5, -5])).toBeTruthy()
      expect(arePointsColinear([-1, 0], [5, -6], [0, -1], [-2, 1])).toBeTruthy()
    })
    test('repeated point', () => {
      expect(arePointsColinear([0, 0], [0, 0], [2, 2], [1, 1])).toBeTruthy()
      expect(arePointsColinear([1, 1], [1, 1], [1, 1], [1, 1])).toBeTruthy()
    })
  })
})
