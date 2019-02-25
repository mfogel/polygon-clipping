/* eslint-env jest */

import { cmp, touch, touchPoints } from '../src/flp'

describe('compare', () => {
  test('exactly equal', () => {
    const a = 1
    const b = 1
    expect(cmp(a, b)).toBe(0)
  })

  test('flp equal', () => {
    const a = 1
    const b = 1 + Number.EPSILON
    expect(cmp(a, b)).toBe(0)
  })

  test('barely less than', () => {
    const a = 1
    const b = 1 + Number.EPSILON * 2
    expect(cmp(a, b)).toBe(-1)
  })

  test('less than', () => {
    const a = 1
    const b = 2
    expect(cmp(a, b)).toBe(-1)
  })

  test('barely more than', () => {
    const a = 1 + Number.EPSILON * 2
    const b = 1
    expect(cmp(a, b)).toBe(1)
  })

  test('more than', () => {
    const a = 2
    const b = 1
    expect(cmp(a, b)).toBe(1)
  })

  test('both flp equal to zero', () => {
    const a = 0.0
    const b = Number.EPSILON - Number.EPSILON * Number.EPSILON
    expect(cmp(a, b)).toBe(0)
  })

  test('really close to zero', () => {
    const a = Number.EPSILON
    const b = Number.EPSILON + Number.EPSILON * Number.EPSILON * 2
    expect(cmp(a, b)).toBe(-1)
  })
})

describe('touch()', () => {
  test('exactly equal', () => {
    expect(touch(1, 1)).toBe(true)
  })

  test('not close', () => {
    expect(touch(1, 0)).toBe(false)
    expect(touch(1, 5)).toBe(false)
  })

  test('within touching more', () => {
    // this is within touching, but not within cmp() === 0
    expect(touch(2, 2 + Number.EPSILON)).toBe(true)
  })

  test('outside touching more', () => {
    expect(touch(0.4, 0.4 + Number.EPSILON)).toBe(false)
  })

  test('within touching less than', () => {
    // this is within touching, but not within cmp() === 0
    expect(touch(2, 2 - Number.EPSILON)).toBe(true)
  })

  test('outside touching less than', () => {
    expect(touch(0.4, 0.4 - Number.EPSILON)).toBe(false)
  })

  test('both flp equal to zero', () => {
    const a = 0.0
    const b = Number.EPSILON - Number.EPSILON * Number.EPSILON
    expect(touch(a, b)).toBe(true)
  })

  test('really close to zero', () => {
    const a = Number.EPSILON
    const b = Number.EPSILON + Number.EPSILON * Number.EPSILON * 2
    expect(touch(a, b)).toBe(true)
  })
})

describe('touchPoints()', () => {
  test('earlier X coord', () => {
    const a = { x: -1, y: 1 }
    const b = { x: 0, y: 0 }
    expect(touchPoints(a, b)).toBe(false)
  })

  test('later X coord', () => {
    const a = { x: 1, y: 0 }
    const b = { x: 0, y: 1 }
    expect(touchPoints(a, b)).toBe(false)
  })

  test('earlier Y coord', () => {
    const a = { x: 0, y: -1 }
    const b = { x: 0, y: 0 }
    expect(touchPoints(a, b)).toBe(false)
  })

  test('later Y coord', () => {
    const a = { x: 0, y: 1 }
    const b = { x: 0, y: 0 }
    expect(touchPoints(a, b)).toBe(false)
  })

  test('equal coord', () => {
    const a = { x: 1, y: 1 }
    const b = { x: 1, y: 1 }
    expect(touchPoints(a, b)).toBe(true)
  })

  test('within touching', () => {
    // this is within touching, but not within cmp() === 0
    const a = { x: 2, y: 2 }
    const b = { x: 2 + Number.EPSILON, y: 2 + Number.EPSILON }
    expect(touchPoints(a, b)).toBe(true)
  })

  test('outside touching', () => {
    const a = { x: 0.4, y: 0.4 }
    const b = { x: 0.4 + Number.EPSILON, y: 0.4 + Number.EPSILON }
    expect(touchPoints(a, b)).toBe(false)
  })

})
