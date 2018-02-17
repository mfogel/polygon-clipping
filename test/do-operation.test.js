/* eslint-env jest */

jest.mock('../src/clean-input')
const cleanInput = require('../src/clean-input')
const doOperation = require('../src/do-operation')

afterEach(() => {
  cleanInput.mockClear()
})

describe('test doOperation calls the right stuff', () => {
  test('clean-input called correctly with multiple subjects', () => {
    const subject1 = [[[0, 0], [2, 0], [0, 2], [0, 0]]]
    const subject2 = [[[0, 0], [1, 0], [0, 1], [0, 0]]]

    // TODO: change when doOperation api changes
    doOperation(null, subject1, subject2)
    expect(cleanInput).toHaveBeenCalledTimes(2)
    expect(cleanInput).toHaveBeenCalledWith(subject1)
    expect(cleanInput).toHaveBeenCalledWith(subject2)
  })

  test('clean-input called correctly with clipping', () => {
    const subject = [[[0, 0], [2, 0], [0, 2], [0, 0]]]
    const clipping = [[[0, 0], [1, 0], [0, 1], [0, 0]]]

    // TODO: change when doOperation api changes
    doOperation(null, subject, clipping)
    expect(cleanInput).toHaveBeenCalledTimes(2)
    expect(cleanInput).toHaveBeenCalledWith(subject)
    expect(cleanInput).toHaveBeenCalledWith(clipping)
  })
})
