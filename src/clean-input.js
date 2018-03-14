const { arePointsEqual } = require('./flp')
const { compareVectorAngles } = require('./vector')

/* WARN: input modified directly */
const forceMultiPoly = geom => {
  if (
    Array.isArray(geom) &&
    Array.isArray(geom[0]) &&
    Array.isArray(geom[0][0])
  ) {
    if (Array.isArray(geom[0][0][0]) && typeof geom[0][0][0][0] === 'number') {
      // multipolygon
      return
    }
    if (typeof geom[0][0][0] === 'number') {
      // polygon
      geom.unshift(geom.splice(0))
      return
    }
  }
  throw new Error('Unrecognized input - not a polygon nor multipolygon')
}

/* WARN: input modified directly */
const cleanMultiPoly = multipoly => {
  let i = 0
  while (i < multipoly.length) {
    const poly = multipoly[i]
    if (poly.length === 0) {
      multipoly.splice(i, 1)
      continue
    }

    const exteriorRing = poly[0]
    cleanRing(exteriorRing)
    // poly is dropped if exteriorRing is degenerate
    if (exteriorRing.length === 0) {
      multipoly.splice(i, 1)
      continue
    }

    let j = 1
    while (j < poly.length) {
      const interiorRing = poly[j]
      cleanRing(interiorRing)
      if (interiorRing.length === 0) poly.splice(j, 1)
      else j++
    }

    i++
  }
}

/* Clean ring:
 *  - remove duplicate points
 *  - remove colinear points
 *  - remove rings with no area (less than 3 distinct points)
 *  - close rings (last point should equal first)
 *
 * WARN: input modified directly */
const cleanRing = ring => {
  if (ring.length === 0) return
  if (!arePointsEqual(ring[0], ring[ring.length - 1])) {
    ring.push([ring[0][0], ring[0][1]]) // copy by value
  }

  const isPointUncessary = (prevPt, pt, nextPt) =>
    arePointsEqual(prevPt, pt) ||
    arePointsEqual(pt, nextPt) ||
    compareVectorAngles(pt, prevPt, nextPt) === 0

  let i = 1
  while (i < ring.length - 1) {
    if (isPointUncessary(ring[i - 1], ring[i], ring[i + 1])) ring.splice(i, 1)
    else i++
  }

  // check the first/last point as well
  while (ring.length > 2) {
    if (!isPointUncessary(ring[ring.length - 2], ring[0], ring[1])) break
    ring.splice(0, 1)
    ring.splice(ring.length - 1, 1)
    ring.push(ring[0])
  }

  // if our ring has less than 3 distinct points now (so is degenerate)
  // shrink it down to the empty array to communicate to our caller to
  // drop it
  while (ring.length < 4 && ring.length > 0) ring.pop()
}

/* Scan the already-linked events of the segments for any
 * self-intersecting input rings (which are not supported) */
const errorOnSelfIntersectingRings = segments => {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]

    // check left event for more than one other linked event from same ring
    const leftLinkedEvents = seg.leftSE.linkedEvents
    if (leftLinkedEvents.length > 2) {
      let cntThisRing = 0
      for (let j = 0; j < leftLinkedEvents.length; j++) {
        if (leftLinkedEvents[j].segment.ringIn === seg.ringIn) cntThisRing++
      }
      if (cntThisRing > 2) {
        const pt = seg.leftSE.point
        throw new Error(`Self-intersecting input ring found at [${pt}]`)
      }
    }

    // check right event for more than one other linked event from same ring
    const rightLinkedEvents = seg.rightSE.linkedEvents
    if (rightLinkedEvents.length > 2) {
      let cntThisRing = 0
      for (let j = 0; j < rightLinkedEvents.length; j++) {
        if (rightLinkedEvents[j].segment.ringIn === seg.ringIn) cntThisRing++
      }
      if (cntThisRing > 2) {
        const pt = seg.rightSE.point
        throw new Error(`Self-intersecting input ring found at [${pt}]`)
      }
    }
  }
}

module.exports = {
  cleanMultiPoly,
  cleanRing,
  errorOnSelfIntersectingRings,
  forceMultiPoly
}
