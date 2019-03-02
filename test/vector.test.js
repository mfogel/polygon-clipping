/* eslint-env jest */

import {
  crossProduct,
  dotProduct,
  length,
  closestPoint,
  compareVectorAngles,
  cosineOfAngle,
  sineOfAngle,
  perpendicular,
  verticalIntersection,
  horizontalIntersection,
  intersection
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

describe('length()', () => {
  test('horizontal', () => {
    const v = { x: 3, y: 0 }
    expect(length(v)).toBe(3)
  })

  test('vertical', () => {
    const v = { x: 0, y: -2 }
    expect(length(v)).toBe(2)
  })

  test('3-4-5', () => {
    const v = { x: 3, y: 4 }
    expect(length(v)).toBe(5)
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

describe('perpendicular()', () => {
  test('vertical', () => {
    const v = { x: 0, y: 1 }
    const r = perpendicular(v)
    expect(dotProduct(v, r)).toBe(0)
    expect(crossProduct(v, r)).not.toBe(0)
  })

  test('horizontal', () => {
    const v = { x: 1, y: 0 }
    const r = perpendicular(v)
    expect(dotProduct(v, r)).toBe(0)
    expect(crossProduct(v, r)).not.toBe(0)
  })

  test('45 degrees', () => {
    const v = { x: 1, y: 1 }
    const r = perpendicular(v)
    expect(dotProduct(v, r)).toBe(0)
    expect(crossProduct(v, r)).not.toBe(0)
  })

  test('120 degrees', () => {
    const v = { x: -1, y: 2 }
    const r = perpendicular(v)
    expect(dotProduct(v, r)).toBe(0)
    expect(crossProduct(v, r)).not.toBe(0)
  })
})

describe('closestPoint()', () => {
  test('on line', () => {
    const pA1 = { x: 2, y: 2 }
    const pA2 = { x: 3, y: 3}
    const pB = { x: -1, y: -1 }
    const cp = closestPoint(pA1, pA2, pB)
    expect(cp).toEqual(pB)
  })

  test('on first point', () => {
    const pA1 = { x: 2, y: 2 }
    const pA2 = { x: 3, y: 3}
    const pB = { x: 2, y: 2 }
    const cp = closestPoint(pA1, pA2, pB)
    expect(cp).toEqual(pB)
  })

  test('off line above', () => {
    const pA1 = { x: 2, y: 2 }
    const pA2 = { x: 3, y: 1}
    const pB = { x: 3, y: 7 }
    const expected = { x: 0, y: 4 }
    expect(closestPoint(pA1, pA2, pB)).toEqual(expected)
    expect(closestPoint(pA2, pA1, pB)).toEqual(expected)
  })

  test('off line below', () => {
    const pA1 = { x: 2, y: 2 }
    const pA2 = { x: 3, y: 1}
    const pB = { x: 0, y: 2 }
    const expected = { x: 1, y: 3 }
    expect(closestPoint(pA1, pA2, pB)).toEqual(expected)
    expect(closestPoint(pA2, pA1, pB)).toEqual(expected)
  })

  test('off line perpendicular to first point', () => {
    const pA1 = { x: 2, y: 2 }
    const pA2 = { x: 3, y: 3 }
    const pB = { x: 1, y: 3 }
    const cp = closestPoint(pA1, pA2, pB)
    const expected = { x: 2, y: 2 }
    expect(cp).toEqual(expected)
  })

  test('horizontal vector', () => {
    const pA1 = { x: 2, y: 2 }
    const pA2 = { x: 3, y: 2}
    const pB = { x: 1, y: 3 }
    const cp = closestPoint(pA1, pA2, pB)
    const expected = { x: 1, y: 2 }
    expect(cp).toEqual(expected)
  })

  test('vertical vector', () => {
    const pA1 = { x: 2, y: 2 }
    const pA2 = { x: 2, y: 3}
    const pB = { x: 1, y: 3 }
    const cp = closestPoint(pA1, pA2, pB)
    const expected = { x: 2, y: 3 }
    expect(cp).toEqual(expected)
  })
})

describe('verticalIntersection()', () => {
  test('horizontal', () => {
    const p = { x: 42, y: 3 }
    const v = { x: -2, y: 0 }
    const x = 37
    const i = verticalIntersection(p, v, x)
    expect(i.x).toBe(37)
    expect(i.y).toBe(3)
  })

  test('vertical', () => {
    const p = { x: 42, y: 3 }
    const v = { x: 0, y: 4 }
    const x = 37
    expect(verticalIntersection(p, v, x)).toBe(null)
  })

  test('45 degree', () => {
    const p = { x: 1, y: 1 }
    const v = { x: 1, y: 1 }
    const x = -2
    const i = verticalIntersection(p, v, x)
    expect(i.x).toBe(-2)
    expect(i.y).toBe(-2)
  })

  test('upper left quadrant', () => {
    const p = { x: -1, y: 1 }
    const v = { x: -2, y: 1 }
    const x = -3
    const i = verticalIntersection(p, v, x)
    expect(i.x).toBe(-3)
    expect(i.y).toBe(2)
  })
})

describe('horizontalIntersection()', () => {
  test('horizontal', () => {
    const p = { x: 42, y: 3 }
    const v = { x: -2, y: 0 }
    const y = 37
    expect(horizontalIntersection(p, v, y)).toBe(null)
  })

  test('vertical', () => {
    const p = { x: 42, y: 3 }
    const v = { x: 0, y: 4 }
    const y = 37
    const i = horizontalIntersection(p, v, y)
    expect(i.x).toBe(42)
    expect(i.y).toBe(37)
  })

  test('45 degree', () => {
    const p = { x: 1, y: 1 }
    const v = { x: 1, y: 1 }
    const y = 4
    const i = horizontalIntersection(p, v, y)
    expect(i.x).toBe(4)
    expect(i.y).toBe(4)
  })

  test('bottom left quadrant', () => {
    const p = { x: -1, y: -1 }
    const v = { x: -2, y: -1 }
    const y = -3
    const i = horizontalIntersection(p, v, y)
    expect(i.x).toBe(-5)
    expect(i.y).toBe(-3)
  })
})

describe('intersection()', () => {
  const p1 = { x: 42, y: 42 }
  const p2 = { x: -32, y: 46 }

  test('parrallel', () => {
    const v1 = { x: 1, y: 2}
    const v2 = { x: -1, y: -2 }
    const i = intersection(p1, v1, p2, v2)
    expect(i).toBe(null)
  })

  test('horizontal and vertical', () => {
    const v1 = { x: 0, y: 2}
    const v2 = { x: -1, y: 0 }
    const i = intersection(p1, v1, p2, v2)
    expect(i.x).toBe(42)
    expect(i.y).toBe(46)
  })

  test('horizontal', () => {
    const v1 = { x: 1, y: 1}
    const v2 = { x: -1, y: 0 }
    const i = intersection(p1, v1, p2, v2)
    expect(i.x).toBe(46)
    expect(i.y).toBe(46)
  })

  test('vertical', () => {
    const v1 = { x: 1, y: 1}
    const v2 = { x: 0, y: 1 }
    const i = intersection(p1, v1, p2, v2)
    expect(i.x).toBe(-32)
    expect(i.y).toBe(-32)
  })

  test('45 degree & 135 degree', () => {
    const v1 = { x: 1, y: 1}
    const v2 = { x: -1, y: 1 }
    const i = intersection(p1, v1, p2, v2)
    expect(i.x).toBe(7)
    expect(i.y).toBe(7)
  })

  test('consistency', () => {
    // Taken from https://github.com/mfogel/polygon-clipping/issues/37
    const p1 = { x: 0.523787, y: 51.281453 }
    const v1 = { x: 0.0002729999999999677, y: 0.0002729999999999677 }
    const p2 = { x: 0.523985, y: 51.281651 }
    const v2 = { x: 0.000024999999999941735, y: 0.000049000000004184585 }
    const i1 = intersection(p1, v1, p2, v2)
    const i2 = intersection(p2, v2, p1, v1)
    expect(i1.x).toBe(i2.x)
    expect(i1.y).toBe(i2.y)
  })
})
