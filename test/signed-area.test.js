/* eslint-env jest */

const signedArea = require('../src/signed-area')

describe('analytical signed area', () => {
  test('negative area', () => {
    expect(signedArea([0, 0], [0, 1], [1, 1])).toBe(-1)
  })

  test('positive area', () => {
    expect(signedArea([0, 1], [0, 0], [1, 0])).toBe(1)
  })

  test('collinear, 0 area', () => {
    expect(signedArea([0, 0], [1, 1], [2, 2])).toBe(0)
  })

  test('point on segment 1', () => {
    expect(signedArea([-1, 0], [2, 3], [0, 1])).toBe(0)
  })

  test('point on segment 2', () => {
    expect(signedArea([2, 3], [-1, 0], [0, 1])).toBe(0)
  })
})
