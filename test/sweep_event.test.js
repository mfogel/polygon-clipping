/* eslint-env jest */

const SweepEvent = require('../src/sweep_event')

describe('sweep event', () => {
  test('isBelow', () => {
    const s1 = new SweepEvent([0, 0], true, new SweepEvent([1, 1], false))
    const s2 = new SweepEvent([0, 1], false, new SweepEvent([0, 0], false))

    expect(s1.isBelow([0, 1])).toBeTruthy()
    expect(s1.isBelow([1, 2])).toBeTruthy()
    expect(s1.isBelow([0, 0])).toBeFalsy()
    expect(s1.isBelow([5, -1])).toBeFalsy()

    expect(s2.isBelow([0, 1])).toBeFalsy()
    expect(s2.isBelow([1, 2])).toBeFalsy()
    expect(s2.isBelow([0, 0])).toBeFalsy()
    expect(s2.isBelow([5, -1])).toBeFalsy()
  })

  test('isAbove', () => {
    const s1 = new SweepEvent([0, 0], true, new SweepEvent([1, 1], false))
    const s2 = new SweepEvent([0, 1], false, new SweepEvent([0, 0], false))

    expect(s1.isAbove([0, 1])).toBeFalsy()
    expect(s1.isAbove([1, 2])).toBeFalsy()
    expect(s1.isAbove([0, 0])).toBeTruthy()
    expect(s1.isAbove([5, -1])).toBeTruthy()

    expect(s2.isAbove([0, 1])).toBeTruthy()
    expect(s2.isAbove([1, 2])).toBeTruthy()
    expect(s2.isAbove([0, 0])).toBeTruthy()
    expect(s2.isAbove([5, -1])).toBeTruthy()
  })

  test('isVertical', () => {
    expect(
      new SweepEvent([0, 0], true, new SweepEvent([0, 1], false)).isVertical()
    ).toBeTruthy()
    expect(
      new SweepEvent(
        [0, 0],
        true,
        new SweepEvent([0.0001, 1], false)
      ).isVertical()
    ).toBeFalsy()
  })
})
