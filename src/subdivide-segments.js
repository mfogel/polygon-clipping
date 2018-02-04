var Tree = require('avl')
var computeFields = require('./compute-fields')
var possibleIntersection = require('./possible-intersection')
var compareSegments = require('./compare-segments')
var operations = require('./operation')

module.exports = (eventQueue, subject, clipping, sbbox, cbbox, operation) => {
  const sweepLine = new Tree(compareSegments)
  const sortedEvents = []

  const rightbound = Math.min(sbbox[2], cbbox[2])

  let prev, next, begin

  while (eventQueue.length) {
    var event = eventQueue.pop()
    sortedEvents.push(event)

    // optimization by bboxes for intersection and difference goes here
    if (
      (operation === operations.INTERSECTION && event.point[0] > rightbound) ||
      (operation === operations.DIFFERENCE && event.point[0] > sbbox[2])
    ) {
      break
    }

    if (event.left) {
      next = prev = sweepLine.insert(event)
      begin = sweepLine.minNode()

      if (prev !== begin) prev = sweepLine.prev(prev)
      else prev = null

      next = sweepLine.next(next)

      var prevEvent = prev ? prev.key : null
      var prevprevEvent
      computeFields(event, prevEvent, operation)
      if (next) {
        if (possibleIntersection(event, next.key, eventQueue) === 2) {
          computeFields(event, prevEvent, operation)
          computeFields(next.key, event, operation)
        }
      }

      if (prev) {
        if (possibleIntersection(prev.key, event, eventQueue) === 2) {
          var prevprev = prev
          if (prevprev !== begin) prevprev = sweepLine.prev(prevprev)
          else prevprev = null

          prevprevEvent = prevprev ? prevprev.key : null
          computeFields(prevEvent, prevprevEvent, operation)
          computeFields(event, prevEvent, operation)
        }
      }
    } else {
      event = event.otherEvent
      next = prev = sweepLine.find(event)

      if (prev && next) {
        if (prev !== begin) prev = sweepLine.prev(prev)
        else prev = null

        next = sweepLine.next(next)
        sweepLine.remove(event)

        if (next && prev) {
          possibleIntersection(prev.key, next.key, eventQueue)
        }
      }
    }
  }
  return sortedEvents
}
