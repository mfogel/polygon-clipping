/* eslint-env jest */

import * as cleanInput from '../src/clean-input'
import operation from '../src/operation'
import doIt from '../src'

describe('doIt calls the right stuff', () => {
  test('pointsAsObjects() called correctly', () => {
    const mp1 = [[[[0, 0], [2, 0], [0, 2], [0, 0]]]]
    const mp2 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const mp3 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]

    cleanInput.pointsAsObjects = jest.fn(cleanInput.pointsAsObjects)
    doIt(operation.types.UNION, mp1, [mp2, mp3])

    expect(cleanInput.pointsAsObjects).toHaveBeenCalledTimes(3)
    expect(cleanInput.pointsAsObjects).toHaveBeenCalledWith(mp1)
    expect(cleanInput.pointsAsObjects).toHaveBeenCalledWith(mp2)
    expect(cleanInput.pointsAsObjects).toHaveBeenCalledWith(mp3)
  })

  test('forceMultiPoly() called correctly', () => {
    const mp1 = [[[[0, 0], [2, 0], [0, 2], [0, 0]]]]
    const mp2 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const mp3 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]

    const mp1Ob = [
      [[{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 0, y: 0 }]]
    ]
    const mp2Ob = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    const mp3Ob = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]

    cleanInput.forceMultiPoly = jest.fn(cleanInput.forceMultiPoly)
    doIt(operation.types.UNION, mp1, [mp2, mp3])

    expect(cleanInput.forceMultiPoly).toHaveBeenCalledTimes(3)
    expect(cleanInput.forceMultiPoly).toHaveBeenCalledWith(mp1Ob)
    expect(cleanInput.forceMultiPoly).toHaveBeenCalledWith(mp2Ob)
    expect(cleanInput.forceMultiPoly).toHaveBeenCalledWith(mp3Ob)
  })

  test('cleanMultiPoly() called correctly', () => {
    const mp1 = [[[[0, 0], [2, 0], [0, 2], [0, 0]]]]
    const mp2 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const mp3 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]

    const mp1Ob = [
      [[{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 0, y: 0 }]]
    ]
    const mp2Ob = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]
    const mp3Ob = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0 }]]
    ]

    cleanInput.cleanMultiPoly = jest.fn(cleanInput.cleanMultiPoly)
    doIt(operation.types.UNION, mp1, [mp2, mp3])

    expect(cleanInput.cleanMultiPoly).toHaveBeenCalledTimes(3)
    expect(cleanInput.cleanMultiPoly).toHaveBeenCalledWith(mp1Ob)
    expect(cleanInput.cleanMultiPoly).toHaveBeenCalledWith(mp2Ob)
    expect(cleanInput.cleanMultiPoly).toHaveBeenCalledWith(mp3Ob)
  })

  test('errorOnSelfIntersectingRings() called', () => {
    const mp1 = [[[[0, 0], [2, 0], [0, 2], [0, 0]]]]
    const mp2 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const mp3 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]

    cleanInput.errorOnSelfIntersectingRings = jest.fn(
      cleanInput.errorOnSelfIntersectingRings
    )
    doIt(operation.types.UNION, mp1, [mp2, mp3])

    expect(cleanInput.errorOnSelfIntersectingRings).toHaveBeenCalledTimes(1)
  })
})
