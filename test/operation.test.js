/* eslint-env jest */

const operation = require('../src/operation')

describe('operation', () => {
  test('register', () => {
    const geom = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]]
    const geoms = [geom, geom, geom, geom, geom]
    operation.register(operation.types.UNION, geoms)
    expect(operation.type).toBe(operation.types.UNION)
    expect(operation.numMultiPolys).toBe(geoms.length)
  })
})
