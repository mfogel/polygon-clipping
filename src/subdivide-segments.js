const Tree = require('avl')
const { arePointsEqual } = require('./point')
const compareSegments = require('./compare-segments')

const possibleIntersection = (se1, se2) => {
  const inters = se1.segment.getIntersections(se2.segment)
  const newEvents = []
  inters.forEach(intersection =>
    [se1, se2].forEach(evt =>
      evt.segment.attemptSplit(intersection).forEach(evt => newEvents.push(evt))
    )
  )
  return newEvents
}

const checkCoincidence = (se1, se2) => {
  const overlap = se1.segment.getOverlap(se2.segment)
  if (overlap !== null && arePointsEqual(overlap[0], se1.point)) {
    se1.registerCoincidentEvent(se2, true)
    se2.registerCoincidentEvent(se1, false)
  }
}

module.exports = eventQueue => {
  const sweepLine = new Tree(compareSegments)
  const sortedEvents = []

  while (!eventQueue.isEmpty) {
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
        eventQueue.push(...possibleIntersection(event, nextEvent))
        checkCoincidence(event, nextEvent)
      }

      if (prevEvent) {
        eventQueue.push(...possibleIntersection(prevEvent, event))
        checkCoincidence(prevEvent, event)
      }
    }

    if (!event.isLeft) sweepLine.remove(event.otherSE)
  }

  return sortedEvents
}
