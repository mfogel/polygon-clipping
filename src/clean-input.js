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

const equals = require('./equals')

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
      if (!equals(ring[0], ring[ring.length - 1])) {
        ring.push([...ring[0]]) // copy by value
      }
    })
  })
}

/* WARN: input modified directly */
module.exports = geom => {
  forceMultiPoly(geom)
  closeAllRings(geom)
}
