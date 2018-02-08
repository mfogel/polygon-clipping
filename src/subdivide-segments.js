const Tree = require('avl')
const possibleIntersection = require('./possible-intersection')
const compareSegments = require('./compare-segments')

module.exports = eventQueue => {
  const sweepLine = new Tree(compareSegments)
  const sortedEvents = []

  while (!eventQueue.isEmpty()) {
    const event = eventQueue.pop()
    sortedEvents.push(event)

    if (event.isLeft) {
      const eventNode = sweepLine.insert(event)
      const prevNode = sweepLine.prev(eventNode)
      const nextNode = sweepLine.next(eventNode)

      const prevEvent = prevNode ? prevNode.key : null
      const nextEvent = nextNode ? nextNode.key : null
      event.registerPrevEvent(prevEvent)

      if (nextEvent) {
        if (possibleIntersection(event, nextEvent, eventQueue)) {
          event.registerPrevEvent(prevEvent)
          nextEvent.registerPrevEvent(event)
        }
      }

      if (prevEvent) {
        if (possibleIntersection(prevEvent, event, eventQueue)) {
          const prevPrev = sweepLine.prev(prevNode)
          const prevPrevEvent = prevPrev ? prevPrev.key : null
          prevEvent.registerPrevEvent(prevPrevEvent)
          event.registerPrevEvent(prevEvent)
        }
      }
    } else sweepLine.remove(event.otherEvent)
  }

  return sortedEvents
}
