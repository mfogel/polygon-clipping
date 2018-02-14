class Ring {
  constructor (segment) {
    this.firstSegment = segment
    this.points = []
    this.build()
  }

  build () {
    const segment = this.firstSegment
    let [prevEvent, event, nextEvent] = [null, segment.leftSE, segment.rightSE]
    this.points = [event.point]
    while (true) {
      prevEvent = event
      event = nextEvent

      this.points.push(event.point)
      event.segment.registerRing(this)

      const linkedEvents = event.availableLinkedEvents
      if (linkedEvents.length === 0) break
      if (linkedEvents.length === 1) nextEvent = linkedEvents[0].otherSE
      if (linkedEvents.length > 1) {
        const comparator = event.getLeftmostComparator(prevEvent)
        nextEvent = linkedEvents.sort(comparator)[0].otherSE
      }
    }
  }
}

module.exports = Ring
