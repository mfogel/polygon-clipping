/* eslint-env jest */

const {
  crossProduct,
  dotProduct,
  compareVectorAngles,
  cosineOfAngle,
  sineOfAngle
} = require('../src/vector')

describe('cross product', () => {
  test('general', () => expect(crossProduct([1, 2], [3, 4])).toEqual(-2))
})

describe('dot product', () => {
  test('general', () => expect(dotProduct([1, 2], [3, 4])).toEqual(11))
})

describe('compare vector angles', () => {
  test('colinear', () => {
    const pt1 = [1, 1]
    const pt2 = [2, 2]
    const pt3 = [3, 3]

    expect(compareVectorAngles(pt1, pt2, pt3)).toBe(0)
    expect(compareVectorAngles(pt2, pt1, pt3)).toBe(0)
    expect(compareVectorAngles(pt2, pt3, pt1)).toBe(0)
    expect(compareVectorAngles(pt3, pt2, pt1)).toBe(0)
  })

  test('offset', () => {
    const pt1 = [0, 0]
    const pt2 = [1, 1]
    const pt3 = [1, 0]

    expect(compareVectorAngles(pt1, pt2, pt3)).toBe(-1)
    expect(compareVectorAngles(pt2, pt1, pt3)).toBe(1)
    expect(compareVectorAngles(pt2, pt3, pt1)).toBe(-1)
    expect(compareVectorAngles(pt3, pt2, pt1)).toBe(1)
  })
})

describe('sine and cosine of angle', () => {
  describe('parallel', () => {
    const shared = [0, 0]
    const base = [1, 0]
    const angle = [1, 0]
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBe(0)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBe(1)
    })
  })

  describe('45 degrees', () => {
    const shared = [0, 0]
    const base = [1, 0]
    const angle = [1, -1]
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBeCloseTo(Math.sqrt(2) / 2)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBeCloseTo(Math.sqrt(2) / 2)
    })
  })

  describe('90 degrees', () => {
    const shared = [0, 0]
    const base = [1, 0]
    const angle = [0, -1]
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBe(1)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBe(0)
    })
  })

  describe('135 degrees', () => {
    const shared = [0, 0]
    const base = [1, 0]
    const angle = [-1, -1]
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBeCloseTo(Math.sqrt(2) / 2)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBeCloseTo(-Math.sqrt(2) / 2)
    })
  })

  describe('anti-parallel', () => {
    const shared = [0, 0]
    const base = [1, 0]
    const angle = [-1, 0]
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBe(-0)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBe(-1)
    })
  })

  describe('225 degrees', () => {
    const shared = [0, 0]
    const base = [1, 0]
    const angle = [-1, 1]
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBeCloseTo(-Math.sqrt(2) / 2)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBeCloseTo(-Math.sqrt(2) / 2)
    })
  })

  describe('270 degrees', () => {
    const shared = [0, 0]
    const base = [1, 0]
    const angle = [0, 1]
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBe(-1)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBe(0)
    })
  })

  describe('315 degrees', () => {
    const shared = [0, 0]
    const base = [1, 0]
    const angle = [1, 1]
    test('sine', () => {
      expect(sineOfAngle(shared, base, angle)).toBeCloseTo(-Math.sqrt(2) / 2)
    })
    test('cosine', () => {
      expect(cosineOfAngle(shared, base, angle)).toBeCloseTo(Math.sqrt(2) / 2)
    })
  })
})
