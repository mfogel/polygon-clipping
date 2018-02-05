/* eslint-env jest */

const path = require('path')
const Queue = require('tinyqueue')
const load = require('load-json-file')
const SweepEvent = require('../src/sweep-event')
const compareEvents = require('../src/compare-events')
const intersection = require('../src/segment-intersection')
const equals = require('../src/equals')
const fillQueue = require('../src/fill-queue')
const divideSegment = require('../src/divide-segment')
const subdivideSegments = require('../src/subdivide-segments')
const possibleIntersection = require('../src/possible-intersection')

// GeoJSON Data
const shapes = load.sync(path.join(__dirname, 'fixtures', 'two_shapes.geojson'))

const Tree = require('avl')
const compareSegments = require('../src/compare-segments')

const subject = shapes.features[0]
const clipping = shapes.features[1]

describe('divide segments', () => {
  test('divide 2 segments', () => {
    const se1 = new SweepEvent(
      [0, 0],
      true,
      new SweepEvent([5, 5], false),
      true
    )
    const se2 = new SweepEvent(
      [0, 5],
      true,
      new SweepEvent([5, 0], false),
      false
    )
    const q = new Queue(null, compareEvents)

    q.push(se1)
    q.push(se2)

    const iter = intersection(
      se1.point,
      se1.otherEvent.point,
      se2.point,
      se2.otherEvent.point
    )

    divideSegment(se1, iter[0], q)
    divideSegment(se2, iter[0], q)

    expect(q.length).toBe(6)
  })

  test('possible intersections', () => {
    const s = subject.geometry.coordinates
    const c = clipping.geometry.coordinates

    const q = new Queue(null, compareEvents)

    const se1 = new SweepEvent(
      s[0][3],
      true,
      new SweepEvent(s[0][2], false),
      true
    )
    const se2 = new SweepEvent(
      c[0][0],
      true,
      new SweepEvent(c[0][1], false),
      false
    )

    expect(possibleIntersection(se1, se2, q)).toBe(1)
    expect(q.length).toBe(4)

    let e = q.pop()
    expect(e.point).toEqual([100.79403384562251, 233.41363754101192])
    expect(e.otherEvent.point).toEqual([56, 181])

    e = q.pop()
    expect(e.point).toEqual([100.79403384562251, 233.41363754101192])
    expect(e.otherEvent.point).toEqual([16, 282])

    e = q.pop()
    expect(e.point).toEqual([100.79403384562251, 233.41363754101192])
    expect(e.otherEvent.point).toEqual([153, 203.5])

    e = q.pop()
    expect(e.point).toEqual([100.79403384562251, 233.41363754101192])
    expect(e.otherEvent.point).toEqual([153, 294.5])
  })

  test('possible intersections on 2 polygons', () => {
    const s = [subject.geometry.coordinates]
    const c = [clipping.geometry.coordinates]

    const q = fillQueue(s, c)
    const p0 = [16, 282]
    const p1 = [298, 359]
    const p2 = [156, 203.5]

    const te = new SweepEvent(p0, true, null, true)
    const te2 = new SweepEvent(p1, false, te, false)
    te.otherEvent = te2

    const te3 = new SweepEvent(p0, true, null, true)
    const te4 = new SweepEvent(p2, true, te3, false)
    te3.otherEvent = te4

    const tr = new Tree(compareSegments)

    expect(tr.insert(te)).toBeTruthy()
    expect(tr.insert(te3)).toBeTruthy()

    expect(tr.find(te).key).toBe(te)
    expect(tr.find(te3).key).toBe(te3)

    expect(compareSegments(te, te3)).toBe(1)
    expect(compareSegments(te3, te)).toBe(-1)

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
          equals(seg.point, data.l) &&
          equals(seg.otherEvent.point, data.r) &&
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
