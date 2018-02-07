/* eslint-env jest */

jest.mock('../src/clean-input')
const cleanInput = require('../src/clean-input')

const doOperation = require('../src/do-operation')
const operationTypes = require('../src/operation-types')

describe('test doOperation calls the right stuff', () => {
  test('clean-input called correctly', () => {
    const subject = [[[0, 0], [2, 0], [0, 2], [0, 0]]]
    const clipping = [[[0, 0], [1, 0], [0, 1], [0, 0]]]

    doOperation(subject, clipping, operationTypes.UNION)
    expect(cleanInput).toHaveBeenCalledTimes(2)
    expect(cleanInput).toHaveBeenCalledWith(subject)
    expect(cleanInput).toHaveBeenCalledWith(clipping)
  })
})
