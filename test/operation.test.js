/* eslint-env jest */

import * as cleanInput from '../src/clean-input'
import operation from '../src/operation'

describe('operation.run() calls the right stuff', () => {
  test('pointsAsObjects() called correctly', () => {
    const mp1 = [[[[0, 0], [2, 0], [0, 2], [0, 0]]]]
    const mp2 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const mp3 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]

    cleanInput.pointsAsObjects = jest.fn(cleanInput.pointsAsObjects)
    operation.run('union', mp1, [mp2, mp3])

    expect(cleanInput.pointsAsObjects).toHaveBeenCalledTimes(3)
    expect(cleanInput.pointsAsObjects).toHaveBeenCalledWith(mp1, expect.any(Array))
    expect(cleanInput.pointsAsObjects).toHaveBeenCalledWith(mp2, expect.any(Array))
    expect(cleanInput.pointsAsObjects).toHaveBeenCalledWith(mp3, expect.any(Array))
  })

  test('forceMultiPoly() called correctly', () => {
    const mp1 = [[[[0, 0], [2, 0], [0, 2], [0, 0]]]]
    const mp2 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const mp3 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]

    const mp1Ob = [[[{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }]]]
    const mp2Ob = [[[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]]]
    const mp3Ob = [[[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]]]

    cleanInput.forceMultiPoly = jest.fn(cleanInput.forceMultiPoly)
    operation.run('union', mp1, [mp2, mp3])

    expect(cleanInput.forceMultiPoly.mock.calls.length === 3)
    expect(cleanInput.forceMultiPoly.mock.calls[0]).toMatchObject([mp1Ob])
    expect(cleanInput.forceMultiPoly.mock.calls[1]).toMatchObject([mp2Ob])
    expect(cleanInput.forceMultiPoly.mock.calls[2]).toMatchObject([mp3Ob])
  })

  test('cleanMultiPoly() called correctly', () => {
    const mp1 = [[[[0, 0], [2, 0], [0, 2], [0, 0]]]]
    const mp2 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const mp3 = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]

    const mp1Ob = [[[{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }]]]
    const mp2Ob = [[[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]]]
    const mp3Ob = [[[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]]]

    cleanInput.cleanMultiPoly = jest.fn(cleanInput.cleanMultiPoly)
    operation.run('union', mp1, [mp2, mp3])

    expect(cleanInput.cleanMultiPoly.mock.calls.length === 3)
    expect(cleanInput.cleanMultiPoly.mock.calls[0]).toMatchObject([mp1Ob])
    expect(cleanInput.cleanMultiPoly.mock.calls[1]).toMatchObject([mp2Ob])
    expect(cleanInput.cleanMultiPoly.mock.calls[2]).toMatchObject([mp3Ob])
  })
})
