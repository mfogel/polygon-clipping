/* eslint-env jest */

jest.mock('../src/clean-input')
const cleanInput = require('../src/clean-input')
const doOperation = require('../src/do-operation')

afterEach(() => {
  cleanInput.closeAllRings.mockClear()
  cleanInput.errorOnSelfIntersectingRings.mockClear()
  cleanInput.forceMultiPoly.mockClear()
})

describe('doOperation calls the right stuff', () => {
  test('closeAllRings() called correctly', () => {
    const poly1 = [[[0, 0], [2, 0], [0, 2], [0, 0]]]
    const poly2 = [[[0, 0], [1, 0], [0, 1], [0, 0]]]
    const poly3 = [[[0, 0], [1, 0], [0, 1], [0, 0]]]

    doOperation(null, poly1, poly2, poly3)
    expect(cleanInput.closeAllRings).toHaveBeenCalledTimes(3)
    expect(cleanInput.closeAllRings).toHaveBeenCalledWith(poly1)
    expect(cleanInput.closeAllRings).toHaveBeenCalledWith(poly2)
    expect(cleanInput.closeAllRings).toHaveBeenCalledWith(poly3)
  })

  test('forceMultiPoly() called correctly', () => {
    const poly1 = [[[0, 0], [2, 0], [0, 2], [0, 0]]]
    const poly2 = [[[0, 0], [1, 0], [0, 1], [0, 0]]]
    const poly3 = [[[0, 0], [1, 0], [0, 1], [0, 0]]]

    doOperation(null, poly1, poly2, poly3)
    expect(cleanInput.forceMultiPoly).toHaveBeenCalledTimes(3)
    expect(cleanInput.forceMultiPoly).toHaveBeenCalledWith(poly1)
    expect(cleanInput.forceMultiPoly).toHaveBeenCalledWith(poly2)
    expect(cleanInput.forceMultiPoly).toHaveBeenCalledWith(poly3)
  })

  test('errorOnSelfIntersectingRings() called', () => {
    const poly1 = [[[0, 0], [2, 0], [0, 2], [0, 0]]]
    const poly2 = [[[0, 0], [1, 0], [0, 1], [0, 0]]]
    const poly3 = [[[0, 0], [1, 0], [0, 1], [0, 0]]]

    doOperation(null, poly1, poly2, poly3)
    expect(cleanInput.errorOnSelfIntersectingRings).toHaveBeenCalledTimes(1)
  })
})
