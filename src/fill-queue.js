const Queue = require('tinyqueue')
const SweepEvent = require('./sweep-event')
const { arePointsEqual } = require('./point')
const compareEvents = require('./compare-events')
const operationType = require('./operation-type')

let contourId = 0

const processPolygon = (contourOrHole, isSubject, depth, Q, isExteriorRing) => {
  for (let i = 0; i < contourOrHole.length - 1; i++) {
    const s1 = contourOrHole[i]
    const s2 = contourOrHole[i + 1]

    // repeated point in input? Skip over it
    if (arePointsEqual(s1, s2)) continue

    const [e1, e2] = SweepEvent.buildPair(s1, s2, isSubject)

    e1.contourId = e2.contourId = depth
    e1.isExteriorRing = e2.isExteriorRing = isExteriorRing

    // Pushing it so the queue is sorted from left to right,
    // with object on the left having the highest priority.
    Q.push(e1)
    Q.push(e2)
  }
}

const fillQueue = (subject, clipping, operation) => {
  const eventQueue = new Queue(null, compareEvents)

  for (let i = 0; i < subject.length; i++) {
    let polygonSet = subject[i]
    for (let j = 0; j < polygonSet.length; j++) {
      const isExteriorRing = j === 0
      if (isExteriorRing) contourId++
      processPolygon(polygonSet[j], true, contourId, eventQueue, isExteriorRing)
    }
  }

  for (let i = 0; i < clipping.length; i++) {
    let polygonSet = clipping[i]
    for (let j = 0; j < polygonSet.length; j++) {
      let isExteriorRing = j === 0
      if (operation === operationType.DIFFERENCE) isExteriorRing = false
      if (isExteriorRing) contourId++
      processPolygon(
        polygonSet[j],
        false,
        contourId,
        eventQueue,
        isExteriorRing
      )
    }
  }

  return eventQueue
}

module.exports = fillQueue
