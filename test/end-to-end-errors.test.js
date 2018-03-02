/* eslint-env jest */

const { union, intersection, xor, difference } = require('../main')

describe('end to end error situations', () => {
  describe('exterior self-intersecting rings', () => {
    test.only('between lines', () => {
      const multipoly = [
        [[[0, 0], [4, 0], [1, 3], [1, 1], [4, 4], [0, 4], [0, 0]]]
      ]
      expect(() => union(multipoly)).toThrow()
      expect(() => intersection(multipoly)).toThrow()
      expect(() => xor(multipoly)).toThrow()
      expect(() => difference(multipoly)).toThrow()
    })

    test('between vertex and line', () => {
      const multipoly = [
        [[[0, 0], [4, 0], [2, 2], [1, 3], [1, 1], [4, 4], [0, 4], [0, 0]]]
      ]
      expect(() => union(multipoly)).toThrow()
      expect(() => intersection(multipoly)).toThrow()
      expect(() => xor(multipoly)).toThrow()
      expect(() => difference(multipoly)).toThrow()
    })

    test('between vertices', () => {
      const multipoly = [
        [
          [
            [0, 0],
            [4, 0],
            [2, 2],
            [1, 3],
            [1, 1],
            [2, 2],
            [4, 4],
            [0, 4],
            [0, 0]
          ]
        ]
      ]
      expect(() => union(multipoly)).toThrow()
      expect(() => intersection(multipoly)).toThrow()
      expect(() => xor(multipoly)).toThrow()
      expect(() => difference(multipoly)).toThrow()
    })
  })

  describe('interior self-intersects rings', () => {
    test('general', () => {
      const multipoly = [
        [
          [[-1, -1], [5, 0], [5, 5], [0, 5], [0, 0]],
          [[0, 0], [0, 4], [4, 4], [1, 1], [1, 3], [4, 0], [0, 0]]
        ]
      ]
      expect(() => union(multipoly)).toThrow()
      expect(() => intersection(multipoly)).toThrow()
      expect(() => xor(multipoly)).toThrow()
      expect(() => difference(multipoly)).toThrow()
    })
  })
})
