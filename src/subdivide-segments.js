const Tree = require('avl')
const possibleIntersection = require('./possible-intersection')
const compareSegments = require('./compare-segments')

module.exports = (eventQueue, subject, clipping, operation) => {
  const sweepLine = new Tree(compareSegments)
  const sortedEvents = []

  while (eventQueue.length) {
    const event = eventQueue.pop()
    sortedEvents.push(event)

    if (event.isLeft) {
      const eventNode = sweepLine.insert(event)
      const prevNode = sweepLine.prev(eventNode)
      const nextNode = sweepLine.next(eventNode)

      const prevEvent = prevNode ? prevNode.key : null
      event.refreshIsInResult(prevEvent, operation)

      if (nextNode) {
        if (possibleIntersection(event, nextNode.key, eventQueue) === 2) {
          event.refreshIsInResult(prevEvent, operation)
          nextNode.key.refreshIsInResult(event, operation)
        }
      }

      if (prevNode) {
        if (possibleIntersection(prevNode.key, event, eventQueue) === 2) {
          const prevprev = sweepLine.prev(prevNode)
          const prevprevEvent = prevprev ? prevprev.key : null
          prevEvent.refreshIsInResult(prevprevEvent, operation)
          event.refreshIsInResult(prevEvent, operation)
        }
      }
    } else sweepLine.remove(event.otherEvent)
  }

  return sortedEvents
}
