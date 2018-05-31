/* eslint-env jest */

import operation from '../src/operation'

describe('operation', () => {
  test('retister', () => {
    const numMps = 5
    operation.register(operation.types.UNION, numMps)
    expect(operation.type).toBe(operation.types.UNION)
    expect(operation.numMultiPolys).toBe(numMps)
  })
})
