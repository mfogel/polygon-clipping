/* eslint-env jest */

jest.mock('../src/clean-input')
const cleanInput = require('../src/clean-input')

const booleanOps = require('../src/index')

describe('test main loop index.js', () => {
  test('clean-input called correctly', () => {
    const subject = [[[0, 0], [2, 0], [0, 2], [0, 0]]]
    const clipping = [[[0, 0], [1, 0], [0, 1], [0, 0]]]

    for (let op in booleanOps) {
      booleanOps[op](subject, clipping)
      expect(cleanInput).toHaveBeenCalledTimes(2)
      expect(cleanInput).toHaveBeenCalledWith(subject)
      expect(cleanInput).toHaveBeenCalledWith(clipping)
      cleanInput.mockClear()
    }
  })
})
