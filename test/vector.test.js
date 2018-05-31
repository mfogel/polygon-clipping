/* eslint-env jest */

import {
  crossProduct,
  dotProduct,
  compareVectorAngles,
  cosineOfAngle,
  sineOfAngle
} from '../src/vector'

describe('cross product', () => {
  test('general', () => {
    const pt1 = { x: 1, y: 2 }
    const pt2 = { x: 3, y: 4 }
    expect(crossProduct(pt1, pt2)).toEqual(-2)
  })
})

describe('dot product', () => {
  test('general', () => {
    const pt1 = { x: 1, y: 2 }
    const pt2 = { x: 3, y: 4 }
    expect(dotProduct(pt1, pt2)).toEqual(11)
  })
})

describe('compare vector angles', () => {
  test('colinear', () => {
    const pt1 = { x: 1, y: 1 }
    const pt2 = { x: 2, y: 2 }
    const pt3 = { x: 3, y: 3 }

    expect(compareVectorAngles(pt1, pt2, pt3)).toBe(0)
    expect(compareVectorAngles(pt2, pt1, pt3)).toBe(0)
    expect(compareVectorAngles(pt2, pt3, pt1)).toBe(0)
    expect(compareVectorAngles(pt3, pt2, pt1)).toBe(0)
  })

  test('offset', () => {
    const pt1 = { x: 0, y: 0 }
    const pt2 = { x: 1, y: 1 }
    const pt3 = { x: 1, y: 0 }

    expect(compareVectorAngles(pt1, pt2, pt3)).toBe(-1)
    expect(compareVectorAngles(pt2, pt1, pt3)).toBe(1)
    expect(compareVectorAngles(pt2, pt3, pt1)).toBe(-1)
    expect(compareVectorAngles(pt3, pt2, pt1)).toBe(1)
  })
})

describe('sine and cosine of angle', () => {
  describe('parallel', () => {
    const shared = { x: 0, y: 0 }
    const base = { x: 1, y: 0 }
    const angle = { x: 1, y: 0 }
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBe(0)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBe(1)
    })
  })

  describe('45 degrees', () => {
    const shared = { x: 0, y: 0 }
    const base = { x: 1, y: 0 }
    const angle = { x: 1, y: -1 }
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBeCloseTo(Math.sqrt(2) / 2)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBeCloseTo(Math.sqrt(2) / 2)
    })
  })

  describe('90 degrees', () => {
    const shared = { x: 0, y: 0 }
    const base = { x: 1, y: 0 }
    const angle = { x: 0, y: -1 }
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBe(1)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBe(0)
    })
  })

  describe('135 degrees', () => {
    const shared = { x: 0, y: 0 }
    const base = { x: 1, y: 0 }
    const angle = { x: -1, y: -1 }
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBeCloseTo(Math.sqrt(2) / 2)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBeCloseTo(-Math.sqrt(2) / 2)
    })
  })

  describe('anti-parallel', () => {
    const shared = { x: 0, y: 0 }
    const base = { x: 1, y: 0 }
    const angle = { x: -1, y: 0 }
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBe(-0)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBe(-1)
    })
  })

  describe('225 degrees', () => {
    const shared = { x: 0, y: 0 }
    const base = { x: 1, y: 0 }
    const angle = { x: -1, y: 1 }
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBeCloseTo(-Math.sqrt(2) / 2)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBeCloseTo(-Math.sqrt(2) / 2)
    })
  })

  describe('270 degrees', () => {
    const shared = { x: 0, y: 0 }
    const base = { x: 1, y: 0 }
    const angle = { x: 0, y: 1 }
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBe(-1)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBe(0)
    })
  })

  describe('315 degrees', () => {
    const shared = { x: 0, y: 0 }
    const base = { x: 1, y: 0 }
    const angle = { x: 1, y: 1 }
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBeCloseTo(-Math.sqrt(2) / 2)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBeCloseTo(Math.sqrt(2) / 2)
    })
  })
})
