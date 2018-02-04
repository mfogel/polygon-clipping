const Queue = require('tinyqueue')
const SweepEvent = require('./sweep-event')
const compareEvents = require('./compare-events')
const operations = require('./operation')

let contourId = 0

const processPolygon = (
  contourOrHole,
  isSubject,
  depth,
  Q,
  bbox,
  isExteriorRing
) => {
  for (let i = 0; i < contourOrHole.length - 1; i++) {
    const s1 = contourOrHole[i]
    const s2 = contourOrHole[i + 1]
    const e1 = new SweepEvent(s1, false, undefined, isSubject)
    const e2 = new SweepEvent(s2, false, e1, isSubject)
    e1.otherEvent = e2

    if (s1[0] === s2[0] && s1[1] === s2[1]) {
      continue // skip collapsed edges, or it breaks
    }

    e1.contourId = e2.contourId = depth
    if (!isExteriorRing) {
      e1.isExteriorRing = false
      e2.isExteriorRing = false
    }
    if (compareEvents(e1, e2) > 0) {
      e2.left = true
    } else {
      e1.left = true
    }

    bbox[0] = Math.min(bbox[0], s1[0])
    bbox[1] = Math.min(bbox[1], s1[1])
    bbox[2] = Math.max(bbox[2], s1[0])
    bbox[3] = Math.max(bbox[3], s1[1])

    // Pushing it so the queue is sorted from left to right,
    // with object on the left having the highest priority.
    Q.push(e1)
    Q.push(e2)
  }
}

const fillQueue = (subject, clipping, sbbox, cbbox, operation) => {
  const eventQueue = new Queue(null, compareEvents)

  for (let i = 0; i < subject.length; i++) {
    let polygonSet = subject[i]
    for (let j = 0; j < polygonSet.length; j++) {
      const isExteriorRing = j === 0
      if (isExteriorRing) contourId++
      processPolygon(
        polygonSet[j],
        true,
        contourId,
        eventQueue,
        sbbox,
        isExteriorRing
      )
    }
  }

  for (let i = 0; i < clipping.length; i++) {
    let polygonSet = clipping[i]
    for (let j = 0; j < polygonSet.length; j++) {
      let isExteriorRing = j === 0
      if (operation === operations.DIFFERENCE) isExteriorRing = false
      if (isExteriorRing) contourId++
      processPolygon(
        polygonSet[j],
        false,
        contourId,
        eventQueue,
        cbbox,
        isExteriorRing
      )
    }
  }

  return eventQueue
}

module.exports = fillQueue
