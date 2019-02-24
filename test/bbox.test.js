/* eslint-env jest */

import {
  getBboxOverlap,
  isInBbox,
  touchesBbox
} from '../src/bbox'

describe('is in bbox', () => {
  test('outside', () => {
    const bbox = { ll: { x: 1, y: 2 }, ur: { x: 5, y: 6 } }
    expect(isInBbox(bbox, { x: 0, y: 3 })).toBeFalsy()
    expect(isInBbox(bbox, { x: 3, y: 30 })).toBeFalsy()
    expect(isInBbox(bbox, { x: 3, y: -30 })).toBeFalsy()
    expect(isInBbox(bbox, { x: 9, y: 3 })).toBeFalsy()
  })

  test('inside', () => {
    const bbox = { ll: { x: 1, y: 2 }, ur: { x: 5, y: 6 } }
    expect(isInBbox(bbox, { x: 1, y: 2 })).toBeTruthy()
    expect(isInBbox(bbox, { x: 5, y: 6 })).toBeTruthy()
    expect(isInBbox(bbox, { x: 1, y: 6 })).toBeTruthy()
    expect(isInBbox(bbox, { x: 5, y: 2 })).toBeTruthy()
    expect(isInBbox(bbox, { x: 3, y: 4 })).toBeTruthy()
  })

  test('barely inside & outside', () => {
    const bbox = { ll: { x: 1, y: 0.8 }, ur: { x: 1.2, y: 6 } }
    expect(isInBbox(bbox, { x: 1.2 - Number.EPSILON, y: 6 })).toBeTruthy()
    expect(isInBbox(bbox, { x: 1.2 + Number.EPSILON, y: 6 })).toBeFalsy()
    expect(isInBbox(bbox, { x: 1, y: 0.8 + Number.EPSILON })).toBeTruthy()
    expect(isInBbox(bbox, { x: 1, y: 0.8 - Number.EPSILON })).toBeFalsy()
  })
})

describe('touchesBbox()', () => {
  test('outside', () => {
    const bbox = { ll: { x: 1, y: 2 }, ur: { x: 5, y: 6 } }
    expect(touchesBbox(bbox, { x: 0, y: 3 })).toBeFalsy()
    expect(touchesBbox(bbox, { x: 3, y: 30 })).toBeFalsy()
    expect(touchesBbox(bbox, { x: 3, y: -30 })).toBeFalsy()
    expect(touchesBbox(bbox, { x: 9, y: 3 })).toBeFalsy()
  })

  test('inside', () => {
    const bbox = { ll: { x: 1, y: 2 }, ur: { x: 5, y: 6 } }
    expect(touchesBbox(bbox, { x: 1, y: 2 })).toBeTruthy()
    expect(touchesBbox(bbox, { x: 5, y: 6 })).toBeTruthy()
    expect(touchesBbox(bbox, { x: 1, y: 6 })).toBeTruthy()
    expect(touchesBbox(bbox, { x: 5, y: 2 })).toBeTruthy()
    expect(touchesBbox(bbox, { x: 3, y: 4 })).toBeTruthy()
  })

  test('barely inside & outside', () => {
    const bbox = { ll: { x: 1, y: 0.8 }, ur: { x: 1.2, y: 6 } }
    expect(touchesBbox(bbox, { x: 1.2 + 2 * Number.EPSILON, y: 6 })).toBeTruthy()
    expect(touchesBbox(bbox, { x: 1.2 + 4 * Number.EPSILON, y: 6 })).toBeFalsy()
    expect(touchesBbox(bbox, { x: 1, y: 0.8 - Number.EPSILON })).toBeTruthy()
    expect(touchesBbox(bbox, { x: 1, y: 0.8 - 2 * Number.EPSILON })).toBeFalsy()
  })
})

describe('bbox overlap', () => {
  const b1 = { ll: { x: 4, y: 4 }, ur: { x: 6, y: 6 } }
  describe('disjoint - none', () => {
    test('above', () => {
      const b2 = { ll: { x: 7, y: 7 }, ur: { x: 8, y: 8 } }
      expect(getBboxOverlap(b1, b2)).toBeNull()
    })
    test('left', () => {
      const b2 = { ll: { x: 1, y: 5 }, ur: { x: 3, y: 8 } }
      expect(getBboxOverlap(b1, b2)).toBeNull()
    })
    test('down', () => {
      const b2 = { ll: { x: 2, y: 2 }, ur: { x: 3, y: 3 } }
      expect(getBboxOverlap(b1, b2)).toBeNull()
    })
    test('right', () => {
      const b2 = { ll: { x: 12, y: 1 }, ur: { x: 14, y: 9 } }
      expect(getBboxOverlap(b1, b2)).toBeNull()
    })
  })

  describe('touching - one point', () => {
    test('upper right corner of 1', () => {
      const b2 = { ll: { x: 6, y: 6 }, ur: { x: 7, y: 8 } }
      expect(getBboxOverlap(b1, b2)).toEqual({
        ll: { x: 6, y: 6 },
        ur: { x: 6, y: 6 }
      })
    })
    test('upper left corner of 1', () => {
      const b2 = { ll: { x: 3, y: 6 }, ur: { x: 4, y: 8 } }
      expect(getBboxOverlap(b1, b2)).toEqual({
        ll: { x: 4, y: 6 },
        ur: { x: 4, y: 6 }
      })
    })
    test('lower left corner of 1', () => {
      const b2 = { ll: { x: 0, y: 0 }, ur: { x: 4, y: 4 } }
      expect(getBboxOverlap(b1, b2)).toEqual({
        ll: { x: 4, y: 4 },
        ur: { x: 4, y: 4 }
      })
    })
    test('lower right corner of 1', () => {
      const b2 = { ll: { x: 6, y: 0 }, ur: { x: 12, y: 4 } }
      expect(getBboxOverlap(b1, b2)).toEqual({
        ll: { x: 6, y: 4 },
        ur: { x: 6, y: 4 }
      })
    })
  })

  describe('overlapping - two points', () => {
    describe('full overlap', () => {
      test('matching bboxes', () => {
        expect(getBboxOverlap(b1, b1)).toEqual(b1)
      })

      test('one side & two corners matching', () => {
        const b2 = { ll: { x: 4, y: 4 }, ur: { x: 5, y: 6 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 4, y: 4 },
          ur: { x: 5, y: 6 }
        })
      })

      test('one corner matching, part of two sides', () => {
        const b2 = { ll: { x: 5, y: 4 }, ur: { x: 6, y: 5 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 5, y: 4 },
          ur: { x: 6, y: 5 }
        })
      })

      test('part of a side matching, no corners', () => {
        const b2 = { ll: { x: 4.5, y: 4.5 }, ur: { x: 5.5, y: 6 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 4.5, y: 4.5 },
          ur: { x: 5.5, y: 6 }
        })
      })

      test('completely enclosed - no side or corner matching', () => {
        const b2 = { ll: { x: 4.5, y: 5 }, ur: { x: 5.5, y: 5.5 } }
        expect(getBboxOverlap(b1, b2)).toEqual(b2)
      })
    })

    describe('partial overlap', () => {
      test('full side overlap', () => {
        const b2 = { ll: { x: 3, y: 4 }, ur: { x: 5, y: 6 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 4, y: 4 },
          ur: { x: 5, y: 6 }
        })
      })

      test('partial side overlap', () => {
        const b2 = { ll: { x: 5, y: 4.5 }, ur: { x: 7, y: 5.5 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 5, y: 4.5 },
          ur: { x: 6, y: 5.5 }
        })
      })

      test('corner overlap', () => {
        const b2 = { ll: { x: 5, y: 5 }, ur: { x: 7, y: 7 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 5, y: 5 },
          ur: { x: 6, y: 6 }
        })
      })
    })
  })

  describe('line bboxes', () => {
    describe('vertical line & normal', () => {
      test('no overlap', () => {
        const b2 = { ll: { x: 7, y: 3 }, ur: { x: 7, y: 6 } }
        expect(getBboxOverlap(b1, b2)).toBeNull()
      })

      test('point overlap', () => {
        const b2 = { ll: { x: 6, y: 0 }, ur: { x: 6, y: 4 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 6, y: 4 },
          ur: { x: 6, y: 4 }
        })
      })

      test('line overlap', () => {
        const b2 = { ll: { x: 5, y: 0 }, ur: { x: 5, y: 9 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 5, y: 4 },
          ur: { x: 5, y: 6 }
        })
      })
    })

    describe('horizontal line & normal', () => {
      test('no overlap', () => {
        const b2 = { ll: { x: 3, y: 7 }, ur: { x: 6, y: 7 } }
        expect(getBboxOverlap(b1, b2)).toBeNull()
      })

      test('point overlap', () => {
        const b2 = { ll: { x: 1, y: 6 }, ur: { x: 4, y: 6 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 4, y: 6 },
          ur: { x: 4, y: 6 }
        })
      })

      test('line overlap', () => {
        const b2 = { ll: { x: 4, y: 6 }, ur: { x: 6, y: 6 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 4, y: 6 },
          ur: { x: 6, y: 6 }
        })
      })
    })

    describe('two vertical lines', () => {
      const v1 = { ll: { x: 4, y: 4 }, ur: { x: 4, y: 6 } }
      test('no overlap', () => {
        const v2 = { ll: { x: 4, y: 7 }, ur: { x: 4, y: 8 } }
        expect(getBboxOverlap(v1, v2)).toBeNull()
      })

      test('point overlap', () => {
        const v2 = { ll: { x: 4, y: 3 }, ur: { x: 4, y: 4 } }
        expect(getBboxOverlap(v1, v2)).toEqual({
          ll: { x: 4, y: 4 },
          ur: { x: 4, y: 4 }
        })
      })

      test('line overlap', () => {
        const v2 = { ll: { x: 4, y: 3 }, ur: { x: 4, y: 5 } }
        expect(getBboxOverlap(v1, v2)).toEqual({
          ll: { x: 4, y: 4 },
          ur: { x: 4, y: 5 }
        })
      })
    })

    describe('two horizontal lines', () => {
      const h1 = { ll: { x: 4, y: 6 }, ur: { x: 7, y: 6 } }
      test('no overlap', () => {
        const h2 = { ll: { x: 4, y: 5 }, ur: { x: 7, y: 5 } }
        expect(getBboxOverlap(h1, h2)).toBeNull()
      })

      test('point overlap', () => {
        const h2 = { ll: { x: 7, y: 6 }, ur: { x: 8, y: 6 } }
        expect(getBboxOverlap(h1, h2)).toEqual({
          ll: { x: 7, y: 6 },
          ur: { x: 7, y: 6 }
        })
      })

      test('line overlap', () => {
        const h2 = { ll: { x: 4, y: 6 }, ur: { x: 7, y: 6 } }
        expect(getBboxOverlap(h1, h2)).toEqual({
          ll: { x: 4, y: 6 },
          ur: { x: 7, y: 6 }
        })
      })
    })

    describe('horizonal and vertical lines', () => {
      test('no overlap', () => {
        const h1 = { ll: { x: 4, y: 6 }, ur: { x: 8, y: 6 } }
        const v1 = { ll: { x: 5, y: 7 }, ur: { x: 5, y: 9 } }
        expect(getBboxOverlap(h1, v1)).toBeNull()
      })

      test('point overlap', () => {
        const h1 = { ll: { x: 4, y: 6 }, ur: { x: 8, y: 6 } }
        const v1 = { ll: { x: 5, y: 5 }, ur: { x: 5, y: 9 } }
        expect(getBboxOverlap(h1, v1)).toEqual({
          ll: { x: 5, y: 6 },
          ur: { x: 5, y: 6 }
        })
      })
    })

    describe('produced line box', () => {
      test('horizontal', () => {
        const b2 = { ll: { x: 4, y: 6 }, ur: { x: 8, y: 8 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 4, y: 6 },
          ur: { x: 6, y: 6 }
        })
      })

      test('vertical', () => {
        const b2 = { ll: { x: 6, y: 2 }, ur: { x: 8, y: 8 } }
        expect(getBboxOverlap(b1, b2)).toEqual({
          ll: { x: 6, y: 4 },
          ur: { x: 6, y: 6 }
        })
      })
    })
  })

  describe('point bboxes', () => {
    describe('point & normal', () => {
      test('no overlap', () => {
        const p = { ll: { x: 2, y: 2 }, ur: { x: 2, y: 2 } }
        expect(getBboxOverlap(b1, p)).toBeNull()
      })
      test('point overlap', () => {
        const p = { ll: { x: 5, y: 5 }, ur: { x: 5, y: 5 } }
        expect(getBboxOverlap(b1, p)).toEqual(p)
      })
    })

    describe('point & line', () => {
      test('no overlap', () => {
        const p = { ll: { x: 2, y: 2 }, ur: { x: 2, y: 2 } }
        const l = { ll: { x: 4, y: 6 }, ur: { x: 4, y: 8 } }
        expect(getBboxOverlap(l, p)).toBeNull()
      })
      test('point overlap', () => {
        const p = { ll: { x: 5, y: 5 }, ur: { x: 5, y: 5 } }
        const l = { ll: { x: 4, y: 5 }, ur: { x: 6, y: 5 } }
        expect(getBboxOverlap(l, p)).toEqual(p)
      })
    })

    describe('point & point', () => {
      test('no overlap', () => {
        const p1 = { ll: { x: 2, y: 2 }, ur: { x: 2, y: 2 } }
        const p2 = { ll: { x: 4, y: 6 }, ur: { x: 4, y: 6 } }
        expect(getBboxOverlap(p1, p2)).toBeNull()
      })
      test('point overlap', () => {
        const p = { ll: { x: 5, y: 5 }, ur: { x: 5, y: 5 } }
        expect(getBboxOverlap(p, p)).toEqual(p)
      })
    })
  })
})
