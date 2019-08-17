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
