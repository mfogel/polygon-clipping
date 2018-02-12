const { arePointsEqual } = require('./point')

const nextPos = (pos, events, processed, origIndex) => {
  let newPos
  // while in range and not the current one by value
  for (newPos = pos + 1; newPos < events.length; newPos++) {
    if (!arePointsEqual(events[pos].point, events[newPos].point)) break
    if (!processed[newPos]) return newPos
  }
  for (newPos = pos - 1; newPos >= origIndex; newPos--) {
    if (!processed[newPos]) break
  }
  return newPos
}

const buildRing = (events, processed, origIndex) => {
  let event = events[origIndex]
  const ring = [event.point]
  let pos = origIndex
  while (pos >= origIndex) {
    ring.push(events[event.pos].point)
    processed[pos] = processed[event.pos] = true
    pos = nextPos(event.pos, events, processed, origIndex)
    event = events[pos]
  }
  return ring
}

const connectEdges = events => {
  // annotate the events with pointers to each other's indexes
  events.forEach((event, i) => (event.otherSE.pos = i))

  const processed = {} // has that index already been processed?
  const result = []

  events.forEach((event, i) => {
    if (processed[i]) return
    const ring = buildRing(events, processed, i)
    if (event.isExteriorRing || result.length === 0) result.push([])
    result[result.length - 1].push(ring)
  })

  return result
}

module.exports = connectEdges
