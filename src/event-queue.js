const TinyQueue = require('tinyqueue')
const SweepEvent = require('./sweep-event')

class EventQueue {
  constructor (comparator = SweepEvent.compare) {
    this.tinyQueue = new TinyQueue(null, comparator)
  }

  push (...events) {
    for (let i = 0; i < events.length; i++) {
      this.tinyQueue.push(events[i])
    }
  }

  pop () {
    const event = this.tinyQueue.pop()
    if (event === undefined) throw new Error('Cannot pop() from empty queue')
    return event
  }

  get isEmpty () {
    return this.tinyQueue.length === 0
  }
}

module.exports = EventQueue
