/* eslint-env jest */

const SweepEvent = require('../src/sweep-event')

describe('sweep event', () => {
  test('isBelow', () => {
    const s1 = SweepEvent.buildPair([0, 0], [1, 1])[0]
    const s2 = SweepEvent.buildPair([0, 1], [0, 0])[0]

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
    const s1 = SweepEvent.buildPair([0, 0], [1, 1])[0]
    const s2 = SweepEvent.buildPair([0, 1], [0, 0])[0]

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
    const s1 = SweepEvent.buildPair([0, 0], [0, 1])[0]
    const s2 = SweepEvent.buildPair([0, 0], [0.0001, 1])[0]

    expect(s1.isVertical()).toBeTruthy()
    expect(s2.isVertical()).toBeFalsy()
  })
})
