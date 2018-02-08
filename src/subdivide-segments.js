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

      if (nextEvent) possibleIntersection(event, nextEvent, eventQueue)
      if (prevEvent) possibleIntersection(prevEvent, event, eventQueue)
    }

    if (!event.isLeft) sweepLine.remove(event.otherSE)
  }

  return sortedEvents
}
