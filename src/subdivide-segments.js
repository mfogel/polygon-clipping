const Tree = require('avl')
const { arePointsEqual } = require('./point')
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
        eventQueue.push(...possibleIntersection(event, nextEvent, eventQueue))

        const overlap = event.segment.getOverlap(nextEvent.segment)
        if (overlap !== null && arePointsEqual(overlap[0], event.point)) {
          event.registerCoincidentEvent(nextEvent, true)
          nextEvent.registerCoincidentEvent(event, false)
        }
      }

      if (prevEvent) {
        eventQueue.push(...possibleIntersection(prevEvent, event))

        const overlap = prevEvent.segment.getOverlap(event.segment)
        if (overlap !== null && arePointsEqual(overlap[0], prevEvent.point)) {
          prevEvent.registerCoincidentEvent(event, true)
          event.registerCoincidentEvent(prevEvent, false)
        }
      }
    }

    if (!event.isLeft) sweepLine.remove(event.otherSE)
  }

  return sortedEvents
}
