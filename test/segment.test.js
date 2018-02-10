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

  test('is subject set 1', () => {
    const seg = new Segment([0, 0], [1, 0], true)
    expect(seg.leftSE.isSubject).toBeTruthy()
    expect(seg.rightSE.isSubject).toBeTruthy()
  })

  test('is subject set 2', () => {
    const seg = new Segment([0, 0], [1, 0], false)
    expect(seg.leftSE.isSubject).toBeFalsy()
    expect(seg.rightSE.isSubject).toBeFalsy()
  })
})

describe('clone', () => {
  test('general', () => {
    const [pt1, pt2] = [[0, 5], [10, 15]]
    const seg = new Segment(pt1, pt2)
    const clone = seg.clone()
    expect(clone.leftSE).not.toBe(seg.leftSE)
    expect(clone.rightSE).not.toBe(seg.rightSE)
    expect(clone.leftSE.point).toEqual(seg.leftSE.point)
    expect(clone.rightSE.point).toEqual(seg.rightSE.point)
  })
})

describe('attempt split', () => {
  test('nope: on point out far away', () => {
    const seg = new Segment([0, 0], [10, 10])
    const pt = [2342, -234.324]
    expect(seg.attemptSplit(pt)).toEqual([])
  })
  test('nope: on point colinear but not on', () => {
    const seg = new Segment([0, 0], [10, 10])
    const pt = [20, 20]
    expect(seg.attemptSplit(pt)).toEqual([])
  })
  test('nope: on point on endpoint', () => {
    const seg = new Segment([0, 0], [10, 10])
    const pt = [10, 10]
    expect(seg.attemptSplit(pt)).toEqual([])
  })
  test('yep: on interior point 1', () => {
    const seg = new Segment([0, 0], [10, 10], true)
    const pt = [5, 5]
    const evts = seg.attemptSplit(pt)
    expect(evts[0].segment).toBe(seg)
    expect(evts[0].point).toEqual(pt)
    expect(evts[0].isRight).toBeTruthy()
    expect(evts[1].segment).not.toBe(seg)
    expect(evts[1].point).toEqual(pt)
    expect(evts[1].isLeft).toBeTruthy()
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment)
    expect(evts[1].isSubject).toBeTruthy()
  })
  test('yep: on interior point 2', () => {
    const seg = new Segment([0, 10], [10, 0], false)
    const pt = [5, 5]
    const evts = seg.attemptSplit(pt)
    expect(evts[0].segment).toBe(seg)
    expect(evts[0].point).toEqual(pt)
    expect(evts[0].isRight).toBeTruthy()
    expect(evts[1].segment).not.toBe(seg)
    expect(evts[1].point).toEqual(pt)
    expect(evts[1].isLeft).toBeTruthy()
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment)
    expect(evts[1].isSubject).toBeFalsy()
  })
})

describe('simple properties - mins, maxes, bbox, vector, points, horizontal/vertical', () => {
  test('general', () => {
    const seg = new Segment([1, 2], [3, 4])
    expect(seg.xmin).toBe(1)
    expect(seg.xmax).toBe(3)
    expect(seg.ymin).toBe(2)
    expect(seg.ymax).toBe(4)
    expect(seg.bbox).toEqual([[1, 2], [3, 4]])
    expect(seg.vector).toEqual([2, 2])
    expect(seg.points).toEqual([[1, 2], [3, 4]])
    expect(seg.isHorizontal).toBeFalsy()
    expect(seg.isVertical).toBeFalsy()
  })

  test('horizontal', () => {
    const seg = new Segment([1, 4], [3, 4])
    expect(seg.xmin).toBe(1)
    expect(seg.xmax).toBe(3)
    expect(seg.ymin).toBe(4)
    expect(seg.ymax).toBe(4)
    expect(seg.bbox).toEqual([[1, 4], [3, 4]])
    expect(seg.vector).toEqual([2, 0])
    expect(seg.points).toEqual([[1, 4], [3, 4]])
    expect(seg.isHorizontal).toBeTruthy()
    expect(seg.isVertical).toBeFalsy()
  })

  test('vertical', () => {
    const seg = new Segment([3, 2], [3, 4])
    expect(seg.xmin).toBe(3)
    expect(seg.xmax).toBe(3)
    expect(seg.ymin).toBe(2)
    expect(seg.ymax).toBe(4)
    expect(seg.bbox).toEqual([[3, 2], [3, 4]])
    expect(seg.vector).toEqual([0, 2])
    expect(seg.points).toEqual([[3, 2], [3, 4]])
    expect(seg.isHorizontal).toBeFalsy()
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

describe('is in interior', () => {
  const p1 = [-1, -1]
  const p2 = [1, 1]
  const seg = new Segment(p1, p2)

  test('yup', () => {
    expect(seg.isInInterior([0, 0])).toBeTruthy()
    expect(seg.isInInterior([0.5, 0.5])).toBeTruthy()
  })

  test('nope', () => {
    expect(seg.isInInterior(p1)).toBeFalsy()
    expect(seg.isInInterior(p2)).toBeFalsy()
    expect(seg.isInInterior([-234, 23421])).toBeFalsy()
  })

  test('nope really close', () => {
    expect(seg.isInInterior([0, 0.0000001])).toBeFalsy()
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

    // TODO: get this better the 1e8 fudge factor is too high
    test('almost colinear - to 15 decimal places', () => {
      const s1 = new Segment([0, 0], [1, 1])
      const s2 = new Segment([2, 2], [3, 3 + 1e8 * Number.EPSILON])
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
