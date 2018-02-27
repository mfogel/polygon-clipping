/* eslint-env jest */

const {
  flpEQ,
  flpLT,
  flpLTE,
  flpCompare,
  arePointsEqual
} = require('../src/flp')

describe('are equal', () => {
  describe('yup', () => {
    test('exactly equal', () => {
      const a = 10
      const b = 10
      expect(flpEQ(a, b)).toBeTruthy()
    })

    test('not exactly equal but flp equal', () => {
      const a = -88.8237166097627
      const b = -88.82371660976271
      expect(flpEQ(a, b)).toBeTruthy()
    })

    test('just barely flp equal', () => {
      const a = 1
      const b = 1 + Number.EPSILON
      expect(flpEQ(a, b)).toBeTruthy()
    })

    test('really close to zero and barely flp equal', () => {
      const a = Number.EPSILON
      const b = Number.EPSILON + Number.EPSILON * Number.EPSILON
      expect(flpEQ(a, b)).toBeTruthy()
    })

    test('both flp equal to zero', () => {
      const a = 0.0
      const b = Number.EPSILON - Number.EPSILON * Number.EPSILON
      expect(flpEQ(a, b)).toBeTruthy()
    })
  })

  describe('nope', () => {
    test('not close', () => {
      const a = 1
      const b = 1.1
      expect(flpEQ(a, b)).toBeFalsy()
    })

    test('just barely not flp equal - ', () => {
      const a = 1
      const b = 1 - Number.EPSILON
      expect(flpEQ(a, b)).toBeFalsy()
    })

    test('really close to zero', () => {
      const a = Number.EPSILON
      const b = Number.EPSILON + Number.EPSILON * Number.EPSILON * 2
      expect(flpEQ(a, b)).toBeFalsy()
    })
  })
})

describe('is less than', () => {
  test('exactly equal', () => {
    const a = 1
    const b = 1
    expect(flpLT(a, b)).toBeFalsy()
  })

  test('flp equal', () => {
    const a = 1
    const b = 1 + Number.EPSILON
    expect(flpLT(a, b)).toBeFalsy()
  })

  test('barely less than', () => {
    const a = 1
    const b = 1 + Number.EPSILON * 2
    expect(flpLT(a, b)).toBeTruthy()
  })

  test('less than', () => {
    const a = 1
    const b = 2
    expect(flpLT(a, b)).toBeTruthy()
  })

  test('barely more than', () => {
    const a = 1 + Number.EPSILON * 2
    const b = 1
    expect(flpLT(a, b)).toBeFalsy()
  })

  test('more than', () => {
    const a = 2
    const b = 1
    expect(flpLT(a, b)).toBeFalsy()
  })
})

describe('is less than or equal', () => {
  test('exactly equal', () => {
    const a = 1
    const b = 1
    expect(flpLTE(a, b)).toBeTruthy()
  })

  test('flp equal', () => {
    const a = 1
    const b = 1 + Number.EPSILON
    expect(flpLTE(a, b)).toBeTruthy()
  })

  test('barely less than', () => {
    const a = 1
    const b = 1 + Number.EPSILON * 2
    expect(flpLTE(a, b)).toBeTruthy()
  })

  test('less than', () => {
    const a = 1
    const b = 2
    expect(flpLTE(a, b)).toBeTruthy()
  })

  test('barely more than', () => {
    const a = 1 + Number.EPSILON * 2
    const b = 1
    expect(flpLTE(a, b)).toBeFalsy()
  })

  test('more than', () => {
    const a = 2
    const b = 1
    expect(flpLTE(a, b)).toBeFalsy()
  })
})

describe('compare', () => {
  test('exactly equal', () => {
    const a = 1
    const b = 1
    expect(flpCompare(a, b)).toBe(0)
  })

  test('flp equal', () => {
    const a = 1
    const b = 1 + Number.EPSILON
    expect(flpCompare(a, b)).toBe(0)
  })

  test('barely less than', () => {
    const a = 1
    const b = 1 + Number.EPSILON * 2
    expect(flpCompare(a, b)).toBe(-1)
  })

  test('less than', () => {
    const a = 1
    const b = 2
    expect(flpCompare(a, b)).toBe(-1)
  })

  test('barely more than', () => {
    const a = 1 + Number.EPSILON * 2
    const b = 1
    expect(flpCompare(a, b)).toBe(1)
  })

  test('more than', () => {
    const a = 2
    const b = 1
    expect(flpCompare(a, b)).toBe(1)
  })
})

describe('are points equal', () => {
  test('yes, easily', () =>
    expect(arePointsEqual([0, 0], [0.0, 0, 0])).toBeTruthy())

  test('yes, barely', () =>
    expect(arePointsEqual([1, 0], [1 + Number.EPSILON, 0])).toBeTruthy())

  test('no, easily', () =>
    expect(arePointsEqual([1000000, 0], [1, 0])).toBeFalsy())

  test('no, barely', () =>
    expect(arePointsEqual([1, 0], [1 - Number.EPSILON, 0])).toBeFalsy())
})
