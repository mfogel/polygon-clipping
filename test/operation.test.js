/* eslint-env jest */

const operation = require('../src/operation')

describe('operation', () => {
  test('set type', () => {
    operation.setType(operation.types.UNION)
    expect(operation.type).toBe(operation.types.UNION)
  })

  test('set multipolys', () => {
    const multiPolys = [{}, {}]
    operation.setMultiPolys(multiPolys)
    expect(operation.multiPolys).toBe(multiPolys)
  })
})
