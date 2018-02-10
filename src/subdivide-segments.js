const SweepLine = require('./sweep-line')

const possibleIntersection = (se1, se2) => {
  const inters = se1.segment.getIntersections(se2.segment)
  let splitOn
  if (inters.length === 0) return []
  if (inters.length === 1) splitOn = inters[0]
  if (inters.length === 2) {
    // we only need to split on first intersection that's not coincident
    // with the current event. The next intersection one will be handled
    // in another pass of the event loop.
    splitOn = se1.isPointEqual(inters[0]) ? inters[1] : inters[0]
  }
  return [
    ...se1.segment.attemptSplit(splitOn),
    ...se2.segment.attemptSplit(splitOn)
  ]
}

module.exports = eventQueue => {
  const sweepLine = new SweepLine()
  const sortedEvents = []

  while (!eventQueue.isEmpty) {
    const event = eventQueue.pop()
    sortedEvents.push(event)

    if (event.isLeft) {
      const node = sweepLine.insert(event)
      const prevEvent = sweepLine.prevKey(node)
      const nextEvent = sweepLine.nextKey(node)

      event.registerPrevEvent(prevEvent)

      if (nextEvent) eventQueue.push(...possibleIntersection(event, nextEvent))
      if (prevEvent) eventQueue.push(...possibleIntersection(prevEvent, event))
    }

    if (event.isRight) {
      const leftEvent = event.otherSE
      const node = sweepLine.find(leftEvent)
      const nextEvent = sweepLine.nextKey(node)

      if (nextEvent && leftEvent.segment.isCoincidentWith(nextEvent.segment)) {
        leftEvent.registerCoincidentEvent(nextEvent, true)
        nextEvent.registerCoincidentEvent(leftEvent, false)
      }

      sweepLine.remove(leftEvent)
    }
  }

  return sortedEvents
}
