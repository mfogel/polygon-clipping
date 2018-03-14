const TinyQueue = require('tinyqueue')
const SweepEvent = require('./sweep-event')

class EventQueue {
  constructor (comparator = SweepEvent.compare) {
    this.tinyQueue = new TinyQueue(null, comparator)
  }

  push (evt) {
    this.tinyQueue.push(evt)
  }

  pop () {
    const evt = this.tinyQueue.pop()
    if (evt === undefined) throw new Error('Cannot pop() from empty queue')
    return evt
  }

  get isEmpty () {
    return this.tinyQueue.length === 0
  }
}

module.exports = EventQueue
