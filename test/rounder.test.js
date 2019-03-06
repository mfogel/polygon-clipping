/* eslint-env jest */

import rounder from '../src/rounder'

describe('rounder.round()', () => {
  test('no overlap', () => {
    rounder.reset()
    const pt1 = {x: 3, y: 4}
    const pt2 = {x: 4, y: 5}
    const pt3 = {x: 5, y: 5}
    expect(rounder.round(pt1.x, pt1.y)).toEqual(pt1)
    expect(rounder.round(pt2.x, pt2.y)).toEqual(pt2)
    expect(rounder.round(pt3.x, pt3.y)).toEqual(pt3)
  })

  test('exact overlap', () => {
    rounder.reset()
    const pt1 = {x: 3, y: 4}
    const pt2 = {x: 4, y: 5}
    const pt3 = {x: 3, y: 4}
    expect(rounder.round(pt1.x, pt1.y)).toEqual(pt1)
    expect(rounder.round(pt2.x, pt2.y)).toEqual(pt2)
    expect(rounder.round(pt3.x, pt3.y)).toEqual(pt3)
  })

  test('rounding one coordinate', () => {
    rounder.reset()
    const pt1 = {x: 3, y: 4}
    const pt2 = {x: 3 + Number.EPSILON, y: 4}
    const pt3 = {x: 3, y: 4 + Number.EPSILON}
    expect(rounder.round(pt1.x, pt1.y)).toEqual(pt1)
    expect(rounder.round(pt2.x, pt2.y)).toEqual(pt1)
    expect(rounder.round(pt3.x, pt3.y)).toEqual(pt1)
  })

  test('rounding both coordinates', () => {
    rounder.reset()
    const pt1 = {x: 3, y: 4}
    const pt2 = {x: 3 + Number.EPSILON, y: 4 + Number.EPSILON}
    expect(rounder.round(pt1.x, pt1.y)).toEqual(pt1)
    expect(rounder.round(pt2.x, pt2.y)).toEqual(pt1)
  })

  test('preseed with 0', () => {
    rounder.reset()
    const pt1 = { x: Number.EPSILON / 2, y: -Number.EPSILON / 2 }
    expect(pt1.x).not.toEqual(0)
    expect(pt1.y).not.toEqual(0)
    expect(rounder.round(pt1.x, pt1.y)).toEqual({ x: 0, y: 0 })
  })
})
