import { compareVectorAngles } from './vector'
import rounder from './rounder'

/* Given input geometry as a standard array-of-arrays geojson-style
 * geometry, return one that uses objects as points, for better perf */
export const pointsAsObjects = geom => {
  // we can handle well-formed multipolys and polys
  const output = []
  if (!Array.isArray(geom)) {
    throw new Error('Input is not a Polygon or MultiPolygon')
  }
  for (let i = 0, iMax = geom.length; i < iMax; i++) {
    if (!Array.isArray(geom[i]) || geom[i].length == 0) {
      throw new Error('Input is not a Polygon or MultiPolygon')
    }
    output.push([])
    for (let j = 0, jMax = geom[i].length; j < jMax; j++) {
      if (!Array.isArray(geom[i][j]) || geom[i][j].length == 0) {
        throw new Error('Input is not a Polygon or MultiPolygon')
      }
      if (Array.isArray(geom[i][j][0])) { // multipolygon
        output[i].push([])
        for (let k = 0, kMax = geom[i][j].length; k < kMax; k++) {
          if (!Array.isArray(geom[i][j][k]) || geom[i][j][k].length < 2) {
            throw new Error('Input is not a Polygon or MultiPolygon')
          }
          if (geom[i][j][k].length > 2) {
            throw new Error(
              'Input has more than two coordinates. ' +
              'Only 2-dimensional polygons supported.'
            )
          }
          output[i][j].push(rounder.round(geom[i][j][k][0], geom[i][j][k][1]))
        }
      } else { // polygon
        if (geom[i][j].length < 2) {
          throw new Error('Input is not a Polygon or MultiPolygon')
        }
        if (geom[i][j].length > 2) {
          throw new Error(
            'Input has more than two coordinates. ' +
            'Only 2-dimensional polygons supported.'
          )
        }
        output[i].push(rounder.round(geom[i][j][0], geom[i][j][1]))
      }
    }
  }
  return output
}

/* WARN: input modified directly */
export const forceMultiPoly = geom => {
  if (Array.isArray(geom)) {
    if (geom.length === 0) return // allow empty multipolys

    if (Array.isArray(geom[0])) {
      if (Array.isArray(geom[0][0])) {
        if (
          typeof geom[0][0][0].x === 'number' &&
          typeof geom[0][0][0].y === 'number'
        ) {
          // multipolygon
          return
        }
      }
      if (
        typeof geom[0][0].x === 'number' &&
        typeof geom[0][0].y === 'number'
      ) {
        // polygon
        geom.unshift(geom.splice(0))
        return
      }
    }
  }
  throw new Error('Unrecognized input - not a polygon nor multipolygon')
}

/* WARN: input modified directly */
export const cleanMultiPoly = multipoly => {
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
 *  - un-close rings (last point should not repeat first)
 *
 * WARN: input modified directly */
export const cleanRing = ring => {
  if (ring.length === 0) return
  const firstPt = ring[0]
  const lastPt = ring[ring.length - 1]
  if (firstPt.x === lastPt.x && firstPt.y === lastPt.y) ring.pop()

  const isPointUncessary = (prevPt, pt, nextPt) =>
    (prevPt.x === pt.x && prevPt.y === pt.y) ||
    (nextPt.x === pt.x && nextPt.y === pt.y) ||
    compareVectorAngles(pt, prevPt, nextPt) === 0

  let i = 0
  let prevPt, nextPt
  while (i < ring.length) {
    prevPt = (i === 0 ? ring[ring.length - 1] : ring[i - 1])
    nextPt = (i === ring.length - 1 ? ring[0] : ring[i + 1])
    if (isPointUncessary(prevPt, ring[i], nextPt)) ring.splice(i, 1)
    else i++
  }

  // if our ring has less than 3 distinct points now (so is degenerate)
  // shrink it down to the empty array to communicate to our caller to
  // drop it
  while (ring.length < 3 && ring.length > 0) ring.pop()
}
