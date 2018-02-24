/**
 * This module expects to take as input the raw <geom> elements.
 * Acceptable forms of input are described in the README.
 *
 * If the input doesn't match an acceptable form, an exception will
 * be thrown.
 *
 * Input will be **modified in place** (for performance) to a
 * standardized multipolygon with self-closing rings.
 */

const { arePointsEqual } = require('./point')

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
      geom[0] = [...geom]
      geom.length = 1
      return
    }
  }
  throw new Error('Unrecognized input - not a polygon nor multipolygon')
}

/* WARN: input modified directly */
const closeAllRings = multipoly => {
  multipoly.forEach(poly => {
    poly.forEach(ring => {
      if (!arePointsEqual(ring[0], ring[ring.length - 1])) {
        ring.push([...ring[0]]) // copy by value
      }
    })
  })
}

/* Scan the already-linked events of the segments for any
 * self-intersecting input rings (which are not supported) */
const errorOnSelfIntersectingRings = segments => {
  segments.forEach(seg => {
    const events = [seg.leftSE, seg.rightSE]
    events.forEach(evt => {
      if (evt.linkedEvents.length <= 2) return
      const fromSameRing = e => e.segment.ringIn === evt.segment.ringIn
      if (evt.linkedEvents.filter(fromSameRing).length > 2) {
        throw new Error(`Self-intersecting input ring found at [${evt.point}]`)
      }
    })
  })
}

module.exports = {
  closeAllRings,
  errorOnSelfIntersectingRings,
  forceMultiPoly
}
