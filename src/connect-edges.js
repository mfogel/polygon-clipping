const { cosineOfAngle, sineOfAngle } = require('./point')

/**
 * Returns a comparator function for sorting linked events that will
 * favor the event that will give us the smallest left-side angle.
 * All ring construction starts as low as possible heading to the right,
 * so by always turning left as sharp as possible we'll get polygons
 * without uncessary loops & holes.
 *
 * The comparator function has a compute cache such that it avoids
 * re-computing already-computed values.
 */
const getLinkedEventsComparator = (prevEvent, event) => {
  const cache = new Map()

  const fillCache = linkedEvent => {
    const nextEvent = linkedEvent.otherSE
    cache.set(linkedEvent, {
      sine: sineOfAngle(event.point, prevEvent.point, nextEvent.point),
      cosine: cosineOfAngle(event.point, prevEvent.point, nextEvent.point)
    })
  }

  const compareCandidates = (a, b) => {
    if (!cache.has(a)) fillCache(a)
    if (!cache.has(b)) fillCache(b)

    const { sine: asine, cosine: acosine } = cache.get(a)
    const { sine: bsine, cosine: bcosine } = cache.get(b)

    if (asine >= 0 && bsine >= 0) {
      if (acosine === bcosine) return 0
      return acosine > bcosine ? -1 : 1
    }
    if (asine < 0 && bsine < 0) {
      if (acosine === bcosine) return 0
      return acosine < bcosine ? -1 : 1
    }
    return asine > bsine ? -1 : 1
  }

  return compareCandidates
}

const buildRing = segment => {
  let [prevEvent, event, nextEvent] = [null, segment.leftSE, segment.rightSE]
  const ring = [event.point]
  while (true) {
    prevEvent = event
    event = nextEvent

    ring.push(event.point)
    event.segment.markProcessed()

    const linkedEvents = event.availableLinkedEvents
    if (linkedEvents.length === 0) break
    if (linkedEvents.length === 1) nextEvent = linkedEvents[0].otherSE
    if (linkedEvents.length > 1) {
      const comparator = getLinkedEventsComparator(prevEvent, event)
      nextEvent = linkedEvents.sort(comparator)[0].otherSE
    }
  }
  return ring
}

const connectEdges = segments => {
  const result = []
  segments.forEach((segment, i) => {
    if (segment.isProcessed) return
    const ring = buildRing(segment)
    // TODO: shouldn't the first ring always be an exterior one?
    if (segment.isExteriorRing || result.length === 0) result.push([])
    result[result.length - 1].push(ring)
  })

  return result
}

module.exports = connectEdges
