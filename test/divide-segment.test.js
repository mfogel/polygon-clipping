/* eslint-env jest */

const EventQueue = require('../src/event-queue')
const Segment = require('../src/segment')
const { arePointsEqual } = require('../src/point')
const divideSegment = require('../src/divide-segment')
const subdivideSegments = require('../src/subdivide-segments')
const possibleIntersection = require('../src/possible-intersection')
const operationTypes = require('../src/operation-types')

const Tree = require('avl')
const compareSegments = require('../src/compare-segments')

const s = [[[16, 282], [298, 359], [153, 203.5], [16, 282]]]
const c = [[[56, 181], [153, 294.5], [241.5, 229.5], [108.5, 120], [56, 181]]]

describe('divide segments', () => {
  test('divide 2 segments', () => {
    const se1 = new Segment([0, 0], [5, 5], true).leftSE
    const se2 = new Segment([0, 5], [5, 0], false).leftSE

    const iter = se1.segment.getIntersections(se2.segment)
    expect(divideSegment(se1, iter[0]).length).toBe(2)
    expect(divideSegment(se2, iter[0]).length).toBe(2)
  })

  test('possible intersections', () => {
    const se1 = new Segment(s[0][3], s[0][2], true).leftSE
    const se2 = new Segment(c[0][0], c[0][1], false).leftSE

    const newEvents = possibleIntersection(se1, se2)
    expect(newEvents.length).toBe(4)

    const inter = [100.79403384562251, 233.41363754101192]
    newEvents.forEach(e => expect(e.point).toEqual(inter))

    // order doesn't matter
    const otherPoints = [s[0][3], s[0][2], c[0][0], c[0][1]]
    otherPoints.forEach(op =>
      expect(
        newEvents.filter(e => arePointsEqual(e.otherSE.point, op)).length
      ).toBe(1)
    )
  })

  test('possible intersections on 2 polygons', () => {
    const q = new EventQueue()
    q.consume([s], true)
    q.consume([c], false)
    const p0 = [16, 282]
    const p1 = [298, 359]
    const p2 = [156, 203.5]

    const te = new Segment(p0, p1, true).leftSE
    const te3 = new Segment(p0, p2, false).leftSE

    const tr = new Tree(compareSegments)

    expect(tr.insert(te)).toBeTruthy()
    expect(tr.insert(te3)).toBeTruthy()

    expect(tr.find(te).key).toBe(te)
    expect(tr.find(te3).key).toBe(te3)

    expect(compareSegments(te, te3)).toBe(1)
    expect(compareSegments(te3, te)).toBe(-1)

    operationTypes.setActive(operationTypes.INTERSECTION)
    const segments = subdivideSegments(q, s, c, 0)
    const leftSegments = []
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].isLeft) {
        leftSegments.push(segments[i])
      }
    }

    expect(leftSegments.length).toBe(11)

    const E = [16, 282]
    const I = [100.79403384562252, 233.41363754101192]
    const G = [298, 359]
    const C = [153, 294.5]
    const J = [203.36313843035356, 257.5101243166895]
    const F = [153, 203.5]
    const D = [56, 181]
    const A = [108.5, 120]
    const B = [241.5, 229.5]

    const intervals = {
      EI: {
        l: E,
        r: I,
        sweepLineEnters: true,
        isInsideOther: false,
        isInResult: false
      },
      IF: {
        l: I,
        r: F,
        sweepLineEnters: true,
        isInsideOther: true,
        isInResult: true
      },
      FJ: {
        l: F,
        r: J,
        sweepLineEnters: true,
        isInsideOther: true,
        isInResult: true
      },
      JG: {
        l: J,
        r: G,
        sweepLineEnters: true,
        isInsideOther: false,
        isInResult: false
      },
      EG: {
        l: E,
        r: G,
        sweepLineEnters: false,
        isInsideOther: false,
        isInResult: false
      },
      DA: {
        l: D,
        r: A,
        sweepLineEnters: true,
        isInsideOther: false,
        isInResult: false
      },
      AB: {
        l: A,
        r: B,
        sweepLineEnters: true,
        isInsideOther: false,
        isInResult: false
      },
      JB: {
        l: J,
        r: B,
        sweepLineEnters: false,
        isInsideOther: false,
        isInResult: false
      },

      CJ: {
        l: C,
        r: J,
        sweepLineEnters: false,
        isInsideOther: true,
        isInResult: true
      },
      IC: {
        l: I,
        r: C,
        sweepLineEnters: false,
        isInsideOther: true,
        isInResult: true
      },

      DI: {
        l: D,
        r: I,
        sweepLineEnters: false,
        isInsideOther: false,
        isInResult: false
      }
    }

    function checkContain (interval) {
      const data = intervals[interval]
      for (let x = 0; x < leftSegments.length; x++) {
        const seg = leftSegments[x]
        if (
          arePointsEqual(seg.point, data.l) &&
          arePointsEqual(seg.otherSE.point, data.r) &&
          seg.sweepLineEnters === data.sweepLineEnters &&
          seg.isInsideOther === data.isInsideOther &&
          seg.isInResult === data.isInResult
        ) {
          expect(true).toBeTruthy()
          return
        }
      }
      expect(false).toBeTruthy()
    }

    Object.keys(intervals).forEach(function (key) {
      checkContain(key)
    })
  })
})
