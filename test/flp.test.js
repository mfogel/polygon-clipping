/* eslint-env jest */

import { cmp } from "../src/flp"

describe("compare", () => {
  test("exactly equal", () => {
    const a = 1
    const b = 1
    expect(cmp(a, b)).toBe(0)
  })

  test("flp equal", () => {
    const a = 1
    const b = 1 + Number.EPSILON
    expect(cmp(a, b)).toBe(0)
  })

  test("barely less than", () => {
    const a = 1
    const b = 1 + Number.EPSILON * 2
    expect(cmp(a, b)).toBe(-1)
  })

  test("less than", () => {
    const a = 1
    const b = 2
    expect(cmp(a, b)).toBe(-1)
  })

  test("barely more than", () => {
    const a = 1 + Number.EPSILON * 2
    const b = 1
    expect(cmp(a, b)).toBe(1)
  })

  test("more than", () => {
    const a = 2
    const b = 1
    expect(cmp(a, b)).toBe(1)
  })

  test("both flp equal to zero", () => {
    const a = 0.0
    const b = Number.EPSILON - Number.EPSILON * Number.EPSILON
    expect(cmp(a, b)).toBe(0)
  })

  test("really close to zero", () => {
    const a = Number.EPSILON
    const b = Number.EPSILON + Number.EPSILON * Number.EPSILON * 2
    expect(cmp(a, b)).toBe(-1)
  })
})
