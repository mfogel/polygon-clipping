/* eslint-env jest */

const Segment = require('../src/segment')

describe('constructor', () => {
  test('cannot build segment with identical points', () => {
    const pt = [0, 5]
    expect(() => new Segment(pt, pt)).toThrow()
  })

  test('correct point on left and right 1', () => {
    const p1 = [0, 0]
    const p2 = [0, 1]
    const seg = new Segment(p1, p2)
    expect(seg.leftSE.point).toEqual(p1)
    expect(seg.rightSE.point).toEqual(p2)
  })

  test('correct point on left and right 1', () => {
    const p1 = [0, 0]
    const p2 = [-1, 0]
    const seg = new Segment(p1, p2)
    expect(seg.leftSE.point).toEqual(p2)
    expect(seg.rightSE.point).toEqual(p1)
  })
})

describe('clone', () => {
  test('general', () => {
    const [pt1, pt2] = [[0, 5], [10, 15]]
    const seg = new Segment(pt1, pt2, {})
    const clone = seg.clone()
    expect(clone.leftSE).not.toBe(seg.leftSE)
    expect(clone.rightSE).not.toBe(seg.rightSE)
    expect(clone.leftSE.point).toEqual(seg.leftSE.point)
    expect(clone.rightSE.point).toEqual(seg.rightSE.point)
    expect(clone.ringIn).toBe(seg.ringIn)
  })
})

describe('split', () => {
  test('on interior point', () => {
    const seg = new Segment([0, 0], [10, 10], true)
    const pt = [5, 5]
    const evts = seg.split(pt)
    expect(evts[0].segment).toBe(seg)
    expect(evts[0].point).toEqual(pt)
    expect(evts[0].isRight).toBeTruthy()
    expect(evts[1].segment).not.toBe(seg)
    expect(evts[1].point).toEqual(pt)
    expect(evts[1].isLeft).toBeTruthy()
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment)
  })
  test('on close-to-but-not-exactly interior point', () => {
    const seg = new Segment([0, 10], [10, 0], false)
    const pt = [5 + Number.EPSILON, 5]
    const evts = seg.split(pt)
    expect(evts[0].segment).toBe(seg)
    expect(evts[0].point).toEqual(pt)
    expect(evts[0].isRight).toBeTruthy()
    expect(evts[1].segment).not.toBe(seg)
    expect(evts[1].point).toEqual(pt)
    expect(evts[1].isLeft).toBeTruthy()
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment)
  })
})

describe('simple properties - bbox, vector, points, isVertical', () => {
  test('general', () => {
    const seg = new Segment([1, 2], [3, 4])
    expect(seg.bbox).toEqual([[1, 2], [3, 4]])
    expect(seg.vector).toEqual([2, 2])
    expect(seg.points).toEqual([[1, 2], [3, 4]])
    expect(seg.isVertical).toBeFalsy()
  })

  test('horizontal', () => {
    const seg = new Segment([1, 4], [3, 4])
    expect(seg.bbox).toEqual([[1, 4], [3, 4]])
    expect(seg.vector).toEqual([2, 0])
    expect(seg.points).toEqual([[1, 4], [3, 4]])
    expect(seg.isVertical).toBeFalsy()
  })

  test('vertical', () => {
    const seg = new Segment([3, 2], [3, 4])
    expect(seg.bbox).toEqual([[3, 2], [3, 4]])
    expect(seg.vector).toEqual([0, 2])
    expect(seg.points).toEqual([[3, 2], [3, 4]])
    expect(seg.isVertical).toBeTruthy()
  })
})

describe('segment getOtherSE', () => {
  test('left to right', () => {
    const seg = new Segment([0, 0], [1, 0], true)
    expect(seg.getOtherSE(seg.leftSE)).toBe(seg.rightSE)
    expect(seg.leftSE.otherSE).toBe(seg.rightSE)
  })

  test('right to left', () => {
    const seg = new Segment([0, 0], [1, 0], true)
    expect(seg.getOtherSE(seg.rightSE)).toBe(seg.leftSE)
    expect(seg.rightSE.otherSE).toBe(seg.leftSE)
  })

  test('doesnt work for Sweep Events that are from other Segments', () => {
    const seg1 = new Segment([0, 0], [1, 0], true)
    const seg2 = new Segment([0, 0], [1, 0], true)
    expect(() => seg1.getOtherSE(seg2.leftSE)).toThrow()
  })
})

describe('segment register ring', () => {
  test('unregistered at first', () => {
    const seg = new Segment([0, 0], [1, 0])
    expect(seg.ringOut).toBeNull()
  })

  test('register it', () => {
    const seg = new Segment([0, 0], [1, 0])
    const ring = {}
    seg.registerRingOut(ring)
    expect(seg.ringOut).toBe(ring)
  })
})

describe('is an endpoint', () => {
  const p1 = [0, -1]
  const p2 = [1, 0]
  const seg = new Segment(p1, p2)

  test('yup', () => {
    expect(seg.isAnEndpoint(p1)).toBeTruthy()
    expect(seg.isAnEndpoint(p2)).toBeTruthy()
  })

  test('nope', () => {
    expect(seg.isAnEndpoint([-34, 46])).toBeFalsy()
    expect(seg.isAnEndpoint([0, 0])).toBeFalsy()
  })
})

describe('is Point On', () => {
  const p1 = [-1, -1]
  const p2 = [1, 1]
  const seg = new Segment(p1, p2)

  test('yup', () => {
    expect(seg.isPointOn(p1)).toBeTruthy()
    expect(seg.isPointOn(p2)).toBeTruthy()
    expect(seg.isPointOn([0, 0])).toBeTruthy()
    expect(seg.isPointOn([0.5, 0.5])).toBeTruthy()
  })

  test('nope', () => {
    expect(seg.isPointOn([-234, 23421])).toBeFalsy()
  })

  test('nope really close', () => {
    expect(seg.isPointOn([0, Number.EPSILON])).toBeFalsy()
  })
})

describe('is coincident with', () => {
  test('yup', () => {
    const a = new Segment([0, -1], [1, 0])
    const b = new Segment([0, -1], [1, 0])
    expect(a.isCoincidentWith(b)).toBeTruthy()
  })

  describe('nope', () => {
    test('nowhere near', () => {
      const a = new Segment([5, -1], [20, 10])
      const b = new Segment([0, -1], [1, 0])
      expect(a.isCoincidentWith(b)).toBeFalsy()
    })

    test('intersect', () => {
      const a = new Segment([-1, 0], [0, 1])
      const b = new Segment([0, -1], [1, 0])
      expect(a.isCoincidentWith(b)).toBeFalsy()
    })

    test('colinear with some overlap but not total', () => {
      const a = new Segment([0, -1], [1, 0])
      const b = new Segment([0, 0], [1, 0])
      expect(a.isCoincidentWith(b)).toBeFalsy()
    })
  })
})

describe('comparison with point', () => {
  test('isPointBelow', () => {
    const s1 = new Segment([0, 0], [1, 1])
    const s2 = new Segment([0, 1], [0, 0])

    expect(s1.isPointBelow([0, 1])).toBeTruthy()
    expect(s1.isPointBelow([1, 2])).toBeTruthy()
    expect(s1.isPointBelow([0, 0])).toBeFalsy()
    expect(s1.isPointBelow([5, -1])).toBeFalsy()

    expect(s2.isPointBelow([0, 1])).toBeFalsy()
    expect(s2.isPointBelow([1, 2])).toBeFalsy()
    expect(s2.isPointBelow([0, 0])).toBeFalsy()
    expect(s2.isPointBelow([5, -1])).toBeFalsy()
  })

  test('isPointColinear', () => {
    const s1 = new Segment([0, 0], [1, 1])
    const s2 = new Segment([0, 1], [0, 0])

    expect(s1.isPointColinear([0, 1])).toBeFalsy()
    expect(s1.isPointColinear([1, 2])).toBeFalsy()
    expect(s1.isPointColinear([0, 0])).toBeTruthy()
    expect(s1.isPointColinear([5, -1])).toBeFalsy()

    expect(s2.isPointColinear([0, 1])).toBeTruthy()
    expect(s2.isPointColinear([1, 2])).toBeFalsy()
    expect(s2.isPointColinear([0, 0])).toBeTruthy()
    expect(s2.isPointColinear([5, -1])).toBeFalsy()
  })

  test('isPointAbove', () => {
    const s1 = new Segment([0, 0], [1, 1])
    const s2 = new Segment([0, 1], [0, 0])

    expect(s1.isPointAbove([0, 1])).toBeFalsy()
    expect(s1.isPointAbove([1, 2])).toBeFalsy()
    expect(s1.isPointAbove([0, 0])).toBeFalsy()
    expect(s1.isPointAbove([5, -1])).toBeTruthy()

    expect(s2.isPointAbove([0, 1])).toBeFalsy()
    expect(s2.isPointAbove([1, 2])).toBeTruthy()
    expect(s2.isPointAbove([0, 0])).toBeFalsy()
    expect(s2.isPointAbove([5, -1])).toBeTruthy()
  })

  test('barely above', () => {
    const s1 = new Segment([0, 1], [3, 1])
    const pt = [2, 1 - Number.EPSILON]
    expect(s1.isPointAbove(pt)).toBeTruthy()
    expect(s1.isPointColinear(pt)).toBeFalsy()
    expect(s1.isPointBelow(pt)).toBeFalsy()
  })

  test('barely below', () => {
    const s1 = new Segment([0, 1], [3, 1])
    const pt = [2, 1 + Number.EPSILON]
    expect(s1.isPointAbove(pt)).toBeFalsy()
    expect(s1.isPointColinear(pt)).toBeFalsy()
    expect(s1.isPointBelow(pt)).toBeTruthy()
  })
})

describe('is colinear with', () => {
  describe('yes', () => {
    test('without any overlap', () => {
      const s1 = new Segment([0, 0], [1, 1])
      const s2 = new Segment([3, 3], [5, 5])
      expect(s1.isColinearWith(s2)).toBeTruthy()
    })

    test('with partial overlap', () => {
      const s1 = new Segment([0, 2], [2, 0])
      const s2 = new Segment([-1, 3], [1, 1])
      expect(s1.isColinearWith(s2)).toBeTruthy()
    })

    test('encapsulating the other', () => {
      const s1 = new Segment([0, 0], [1, 1])
      const s2 = new Segment([-1, -1], [2, 2])
      expect(s1.isColinearWith(s2)).toBeTruthy()
    })

    test('perfect match', () => {
      const s1 = new Segment([0, 1], [1, 0])
      const s2 = new Segment([0, 1], [1, 0])
      expect(s1.isColinearWith(s2)).toBeTruthy()
    })

    test('horizontal', () => {
      const s1 = new Segment([0, 1], [1, 1])
      const s2 = new Segment([-10, 1], [-5, 1])
      expect(s1.isColinearWith(s2)).toBeTruthy()
    })

    test('vertical', () => {
      const s1 = new Segment([0, 0], [0, 1])
      const s2 = new Segment([0, 1], [0, 2])
      expect(s1.isColinearWith(s2)).toBeTruthy()
    })
  })

  describe('no', () => {
    test('general', () => {
      const s1 = new Segment([0, 0], [1, 1])
      const s2 = new Segment([0, 1], [5, 2])
      expect(s1.isColinearWith(s2)).toBeFalsy()
    })

    test('parallel but not colinear', () => {
      const s1 = new Segment([0, 0], [1, 1])
      const s2 = new Segment([0, 1], [1, 2])
      expect(s1.isColinearWith(s2)).toBeFalsy()
    })

    test('perpendicular', () => {
      const s1 = new Segment([0, 1], [1, 0])
      const s2 = new Segment([0, 0], [1, 1])
      expect(s1.isColinearWith(s2)).toBeFalsy()
    })

    test('almost colinear', () => {
      const s1 = new Segment([0, 0], [1, 1])
      const s2 = new Segment([0, 0], [1, 1 + Number.EPSILON])
      expect(s1.isColinearWith(s2)).toBeFalsy()
    })
  })
})

describe('get intersections 2', () => {
  test('colinear full overlap', () => {
    const s1 = new Segment([0, 0], [1, 1])
    const s2 = new Segment([0, 0], [1, 1])
    const inters = [[0, 0], [1, 1]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap upward slope', () => {
    const s1 = new Segment([0, 0], [2, 2])
    const s2 = new Segment([1, 1], [3, 3])
    const inters = [[1, 1], [2, 2]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap downward slope', () => {
    const s1 = new Segment([0, 2], [2, 0])
    const s2 = new Segment([-1, 3], [1, 1])
    const inters = [[0, 2], [1, 1]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap horizontal', () => {
    const s1 = new Segment([0, 1], [2, 1])
    const s2 = new Segment([1, 1], [3, 1])
    const inters = [[1, 1], [2, 1]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear partial overlap vertical', () => {
    const s1 = new Segment([0, 0], [0, 3])
    const s2 = new Segment([0, 2], [0, 4])
    const inters = [[0, 2], [0, 3]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear endpoint overlap', () => {
    const s1 = new Segment([0, 0], [1, 1])
    const s2 = new Segment([1, 1], [2, 2])
    const inters = [[1, 1]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('colinear no overlap', () => {
    const s1 = new Segment([0, 0], [1, 1])
    const s2 = new Segment([3, 3], [4, 4])
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('parallel no overlap', () => {
    const s1 = new Segment([0, 0], [1, 1])
    const s2 = new Segment([0, 3], [1, 4])
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('intersect general', () => {
    const s1 = new Segment([0, 0], [2, 2])
    const s2 = new Segment([0, 2], [2, 0])
    const inters = [[1, 1]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('T-intersect with an endpoint', () => {
    const s1 = new Segment([0, 0], [2, 2])
    const s2 = new Segment([1, 1], [5, 4])
    const inters = [[1, 1]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('intersect with vertical', () => {
    const s1 = new Segment([0, 0], [5, 5])
    const s2 = new Segment([3, 0], [3, 44])
    const inters = [[3, 3]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('intersect with horizontal', () => {
    const s1 = new Segment([0, 0], [5, 5])
    const s2 = new Segment([0, 3], [23, 3])
    const inters = [[3, 3]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('horizontal and vertical T-intersection', () => {
    const s1 = new Segment([0, 0], [5, 0])
    const s2 = new Segment([3, 0], [3, 5])
    const inters = [[3, 0]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('horizontal and vertical general intersection', () => {
    const s1 = new Segment([0, 0], [5, 0])
    const s2 = new Segment([3, -5], [3, 5])
    const inters = [[3, 0]]
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('no intersection not even close', () => {
    const s1 = new Segment([1000, 10002], [2000, 20002])
    const s2 = new Segment([-234, -123], [-12, -23])
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('no intersection kinda close', () => {
    const s1 = new Segment([0, 0], [4, 4])
    const s2 = new Segment([0, 10], [10, 0])
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('no intersection with vertical touching bbox', () => {
    const s1 = new Segment([0, 0], [4, 4])
    const s2 = new Segment([2, -5], [2, 0])
    const inters = []
    expect(s1.getIntersections(s2)).toEqual(inters)
    expect(s2.getIntersections(s1)).toEqual(inters)
  })

  test('shared point 1', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0, 1], [0, 0])
    const inters = [[0, 0]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('shared point 2', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0, 1], [1, 1])
    const inters = [[1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('T-crossing', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0.5, 0.5], [1, 0])
    const inters = [[0.5, 0.5]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = new Segment([0, 0], [10, 10])
    const b = new Segment([1, 1], [5, 5])
    const inters = [[1, 1], [5, 5]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('shared point + overlap', () => {
    const a = new Segment([1, 1], [10, 10])
    const b = new Segment([1, 1], [5, 5])
    const inters = [[1, 1], [5, 5]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('mutual overlap', () => {
    const a = new Segment([3, 3], [10, 10])
    const b = new Segment([0, 0], [5, 5])
    const inters = [[3, 3], [5, 5]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('full overlap', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0, 0], [1, 1])
    const inters = [[0, 0], [1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('full overlap, orientation', () => {
    const a = new Segment([1, 1], [0, 0])
    const b = new Segment([0, 0], [1, 1])
    const inters = [[0, 0], [1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, shared point', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([1, 1], [2, 2])
    const inters = [[1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, shared other point', () => {
    const a = new Segment([1, 1], [0, 0])
    const b = new Segment([1, 1], [2, 2])
    const inters = [[1, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, one encloses other', () => {
    const a = new Segment([0, 0], [4, 4])
    const b = new Segment([1, 1], [2, 2])
    const inters = [[1, 1], [2, 2]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, one encloses other 2', () => {
    const a = new Segment([4, 0], [0, 4])
    const b = new Segment([3, 1], [1, 3])
    const inters = [[1, 3], [3, 1]]
    expect(a.getIntersections(b)).toEqual(inters)
    expect(b.getIntersections(a)).toEqual(inters)
  })

  test('colinear, no overlap', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([2, 2], [4, 4])
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })

  test('parallel', () => {
    const a = new Segment([0, 0], [1, 1])
    const b = new Segment([0, -1], [1, 0])
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })

  test('parallel, orientation', () => {
    const a = new Segment([1, 1], [0, 0])
    const b = new Segment([0, -1], [1, 0])
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })

  test('parallel, position', () => {
    const a = new Segment([0, -1], [1, 0])
    const b = new Segment([0, 0], [1, 1])
    expect(a.getIntersections(b)).toEqual([])
    expect(b.getIntersections(a)).toEqual([])
  })
})

describe('compare segments', () => {
  describe('non intersecting', () => {
    test('not in same vertical space', () => {
      const seg1 = new Segment([0, 0], [1, 1])
      const seg2 = new Segment([4, 3], [6, 7])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('in same vertical space, earlier is below', () => {
      const seg1 = new Segment([0, 0], [4, -4])
      const seg2 = new Segment([1, 1], [6, 7])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('in same vertical space, later is below', () => {
      const seg1 = new Segment([0, 0], [4, -4])
      const seg2 = new Segment([-5, -5], [6, -7])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with left points in same vertical line', () => {
      const seg1 = new Segment([0, 0], [4, 4])
      const seg2 = new Segment([0, -1], [-5, -5])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with earlier right point directly under later left point', () => {
      const seg1 = new Segment([0, 0], [4, 4])
      const seg2 = new Segment([-5, -5], [0, -3])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('with eariler right point directly over earlier left point', () => {
      const seg1 = new Segment([0, 0], [4, 4])
      const seg2 = new Segment([-5, 5], [0, 3])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('intersecting not on endpoint', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([-1, -5], [1, 2])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from directly over & below', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([0, -2], [3, 2])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from after & below', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([1, -2], [3, 2])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('later comes down from before & above', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([-1, 5], [1, -2])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from directly over & above', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([0, 2], [3, -2])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from after & above', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([1, 2], [3, -2])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('intersect but not share on an endpoint', () => {
    test('intersect on right', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([2, -2], [6, 2])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('intersect on left from above', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([-2, 2], [2, -2])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('intersect on left from below', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([-2, -2], [2, 2])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('share right endpoint', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([-1, -5], [4, 0])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from directly over & below', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([0, -2], [4, 0])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('earlier comes up from after & below', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([1, -2], [4, 0])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('later comes down from before & above', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([-1, 5], [4, 0])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('laterjcomes up from directly over & above', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([0, 2], [4, 0])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })

    test('later comes up from after & above', () => {
      const seg1 = new Segment([0, 0], [4, 0])
      const seg2 = new Segment([1, 2], [4, 0])
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)
    })
  })

  describe('share left endpoint but not colinear', () => {
    test('earlier comes up from before & below', () => {
      const seg1 = new Segment([0, 0], [4, 4])
      const seg2 = new Segment([0, 0], [4, 2])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })
  })

  describe('colinear', () => {
    test('partial mutal overlap', () => {
      const seg1 = new Segment([0, 0], [4, 4])
      const seg2 = new Segment([-1, -1], [2, 2])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('complete overlap', () => {
      const seg1 = new Segment([0, 0], [4, 4])
      const seg2 = new Segment([-1, -1], [5, 5])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('right endpoints match', () => {
      const seg1 = new Segment([0, 0], [4, 4])
      const seg2 = new Segment([-1, -1], [4, 4])
      expect(Segment.compare(seg1, seg2)).toBe(1)
      expect(Segment.compare(seg2, seg1)).toBe(-1)
    })

    test('left endpoints match - should be sorted by ring id', () => {
      const seg1 = new Segment([0, 0], [4, 4], { id: 1 })
      const seg2 = new Segment([0, 0], [3, 3], { id: 2 })
      const seg3 = new Segment([0, 0], [5, 5], { id: 3 })
      expect(Segment.compare(seg1, seg2)).toBe(-1)
      expect(Segment.compare(seg2, seg1)).toBe(1)

      expect(Segment.compare(seg2, seg3)).toBe(-1)
      expect(Segment.compare(seg3, seg2)).toBe(1)

      expect(Segment.compare(seg1, seg3)).toBe(-1)
      expect(Segment.compare(seg3, seg1)).toBe(1)
    })
  })

  test('exactly equal segments should be sorted by ring id', () => {
    const seg1 = new Segment([0, 0], [4, 4], { id: 1 })
    const seg2 = new Segment([0, 0], [4, 4], { id: 2 })
    expect(Segment.compare(seg1, seg2)).toBe(-1)
    expect(Segment.compare(seg2, seg1)).toBe(1)
  })

  test('exactly equal segments (but not identical) should throw error', () => {
    const seg1 = new Segment([0, 0], [4, 4], { id: 1 })
    const seg2 = new Segment([0, 0], [4, 4], { id: 1 })
    expect(() => Segment.compare(seg1, seg2)).toThrow()
  })
})
