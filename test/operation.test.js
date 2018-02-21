/* eslint-env jest */

const operation = require('../src/operation')

describe('operation', () => {
  test('set type', () => {
    operation.setType(operation.types.UNION)
    expect(operation.type).toBe(operation.types.UNION)
  })

  test('set number of geoms', () => {
    operation.setNumberOfGeoms(4)
    expect(operation.numberOfGeoms).toBe(4)
  })
})
