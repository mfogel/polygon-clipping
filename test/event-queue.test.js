/* eslint-env jest */

const EventQueue = require('../src/event-queue')
const SweepEvent = require('../src/sweep-event')

describe('event queue', () => {
  test('insert one get it back', () => {
    const queue = new EventQueue()
    const swe1 = new SweepEvent([5, 5])

    queue.push(swe1)
    expect(queue.pop()).toBe(swe1)
  })

  test('insert two get them back sorted', () => {
    const queue = new EventQueue()
    const swe1 = new SweepEvent([1, 5])
    const swe2 = new SweepEvent([5, 5])

    queue.push(swe1)
    queue.push(swe2)
    expect(queue.pop()).toBe(swe1)
    expect(queue.pop()).toBe(swe2)
    expect(queue.isEmpty).toBeTruthy()

    queue.push(swe2)
    queue.push(swe1)
    expect(queue.pop()).toBe(swe1)
    expect(queue.pop()).toBe(swe2)
    expect(queue.isEmpty).toBeTruthy()
  })

  test('poping an empty queue throws', () => {
    const queue = new EventQueue()
    expect(queue.isEmpty).toBeTruthy()
    expect(() => queue.pop()).toThrow()
  })
})
