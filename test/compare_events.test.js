/* eslint-env jest */

const Queue = require('tinyqueue')
const sweepEventsComp = require('../src/compare_events')
const SweepEvent = require('../src/sweep_event')

describe('queue', () => {
  test('queue should process lest(by x) sweep event first', () => {
    const queue = new Queue(null, sweepEventsComp)
    const e1 = { point: [0.0, 0.0] }
    const e2 = { point: [0.5, 0.5] }

    queue.push(e1)
    queue.push(e2)

    expect(queue.pop()).toBe(e1)
    expect(queue.pop()).toBe(e2)
  })

  test('queue should process lest(by y) sweep event first', () => {
    const queue = new Queue(null, sweepEventsComp)
    const e1 = { point: [0.0, 0.0] }
    const e2 = { point: [0.0, 0.5] }

    queue.push(e1)
    queue.push(e2)

    expect(queue.pop()).toBe(e1)
    expect(queue.pop()).toBe(e2)
  })

  test('queue should pop least(by left prop) sweep event first', () => {
    const queue = new Queue(null, sweepEventsComp)
    const e1 = { point: [0.0, 0.0], left: true }
    const e2 = { point: [0.0, 0.0], left: false }

    queue.push(e1)
    queue.push(e2)

    expect(queue.pop()).toBe(e2)
    expect(queue.pop()).toBe(e1)
  })
})

describe('sweep event comparison', () => {
  test('x coordinates', () => {
    const e1 = { point: [0.0, 0.0] }
    const e2 = { point: [0.5, 0.5] }

    expect(sweepEventsComp(e1, e2)).toBe(-1)
    expect(sweepEventsComp(e2, e1)).toBe(1)
  })

  test('y coordinates', () => {
    const e1 = { point: [0.0, 0.0] }
    const e2 = { point: [0.0, 0.5] }

    expect(sweepEventsComp(e1, e2)).toBe(-1)
    expect(sweepEventsComp(e2, e1)).toBe(1)
  })

  test('not left first', () => {
    const e1 = { point: [0.0, 0.0], left: true }
    const e2 = { point: [0.0, 0.0], left: false }

    expect(sweepEventsComp(e1, e2)).toBe(1)
    expect(sweepEventsComp(e2, e1)).toBe(-1)
  })

  test('shared start point not collinear edges', () => {
    const e1 = new SweepEvent([0.0, 0.0], true, new SweepEvent([1, 1], false))
    const e2 = new SweepEvent([0.0, 0.0], true, new SweepEvent([2, 3], false))

    expect(sweepEventsComp(e1, e2)).toBe(-1)
    expect(sweepEventsComp(e2, e1)).toBe(1)
  })

  test('collinear edges', () => {
    const e1 = new SweepEvent(
      [0.0, 0.0],
      true,
      new SweepEvent([1, 1], false),
      true
    )
    const e2 = new SweepEvent(
      [0.0, 0.0],
      true,
      new SweepEvent([2, 2], false),
      false
    )

    expect(sweepEventsComp(e1, e2)).toBe(-1)
    expect(sweepEventsComp(e2, e1)).toBe(1)
  })
})
