/* eslint-env jest */

const EventQueue = require('../src/event-queue')
const sweepEventsComp = require('../src/compare-events')
const SweepEvent = require('../src/sweep-event')

describe('queue', () => {
  test('queue should process lest(by x) sweep event first', () => {
    const queue = new EventQueue()
    const e1 = { point: [0.0, 0.0] }
    const e2 = { point: [0.5, 0.5] }
    queue.push(e1, e2)

    expect(queue.pop()).toBe(e1)
    expect(queue.pop()).toBe(e2)
  })

  test('queue should process lest(by y) sweep event first', () => {
    const queue = new EventQueue()
    const e1 = { point: [0.0, 0.0] }
    const e2 = { point: [0.0, 0.5] }
    queue.push(e1, e2)

    expect(queue.pop()).toBe(e1)
    expect(queue.pop()).toBe(e2)
  })

  test('queue should pop least(by isLeft prop) sweep event first', () => {
    const queue = new EventQueue()
    const e1 = { point: [0.0, 0.0], isLeft: false }
    const e2 = { point: [0.0, 0.0], isLeft: true }
    queue.push(e1, e2)

    expect(queue.pop()).toBe(e1)
    expect(queue.pop()).toBe(e2)
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
    const e1 = { point: [0.0, 0.0], isLeft: true }
    const e2 = { point: [0.0, 0.0], isLeft: false }

    expect(sweepEventsComp(e1, e2)).toBe(1)
    expect(sweepEventsComp(e2, e1)).toBe(-1)
  })

  test('shared start point not collinear edges', () => {
    const e1 = SweepEvent.buildPair([0, 0], [1, 1])[0]
    const e2 = SweepEvent.buildPair([0, 0], [2, 3])[0]

    expect(sweepEventsComp(e1, e2)).toBe(-1)
    expect(sweepEventsComp(e2, e1)).toBe(1)
  })

  test('collinear edges', () => {
    const e1 = SweepEvent.buildPair([0, 0], [1, 1], true)[0]
    const e2 = SweepEvent.buildPair([0, 0], [2, 2], false)[0]

    expect(sweepEventsComp(e1, e2)).toBe(-1)
    expect(sweepEventsComp(e2, e1)).toBe(1)
  })
})
