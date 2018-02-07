const Tree = require('avl')
const possibleIntersection = require('./possible-intersection')
const compareSegments = require('./compare-segments')

module.exports = (eventQueue, subject, clipping) => {
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
      event.refreshIsInResult(prevEvent)

      if (nextNode) {
        if (possibleIntersection(event, nextNode.key, eventQueue) === 2) {
          event.refreshIsInResult(prevEvent)
          nextNode.key.refreshIsInResult(event)
        }
      }

      if (prevNode) {
        if (possibleIntersection(prevNode.key, event, eventQueue) === 2) {
          const prevprev = sweepLine.prev(prevNode)
          const prevprevEvent = prevprev ? prevprev.key : null
          prevEvent.refreshIsInResult(prevprevEvent)
          event.refreshIsInResult(prevEvent)
        }
      }
    } else sweepLine.remove(event.otherEvent)
  }

  return sortedEvents
}
