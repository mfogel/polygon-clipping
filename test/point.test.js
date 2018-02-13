/* eslint-env jest */

const {
  arePointsEqual,
  crossProduct,
  dotProduct,
  sineOfAngle,
  cosineOfAngle
} = require('../src/point')

describe('are points equal', () => {
  test('yes', () => expect(arePointsEqual([0, 0], [0.0, 0, 0])).toBeTruthy())
  test('no', () => expect(arePointsEqual([0, 0], [1, 0])).toBeFalsy())
})

describe('cross product', () => {
  test('general', () => expect(crossProduct([1, 2], [3, 4])).toEqual(-2))
})

describe('dot product', () => {
  test('general', () => expect(dotProduct([1, 2], [3, 4])).toEqual(11))
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
