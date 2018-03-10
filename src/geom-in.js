const Segment = require('./segment')
const { arePointsEqual } = require('./flp')

// Give rings unique ID's to get consistent sorting of segments
// and sweep events when all else is identical
let ringId = 0

class Ring {
  constructor (geomRing, isExterior, poly) {
    this.id = ringId++
    this.poly = poly
    this.isExterior = isExterior
    this.isInterior = !isExterior
    this.segments = []

    let prevPoint = null
    geomRing.forEach(point => {
      if (prevPoint !== null) {
        this.segments.push(new Segment(prevPoint, point, this))
      }
      prevPoint = point
    })
  }

  get sweepEvents () {
    return [].concat(...this.segments.map(seg => [seg.leftSE, seg.rightSE]))
  }

  /* Given a segment on this rings with these relationships to other rings,
   * is it a valid segment of the ring's poly? */
  isValid (ringsSameSLER, ringsDiffSLER, ringsInsideOf) {
    const exterior = this.poly.exteriorRing
    const interiors = this.poly.interiorRings

    if (this === exterior) {
      // exterior segments inside or interior, nope
      if (ringsInsideOf.some(r => interiors.includes(r))) return false

      // overlap with an interior of same SWL orientatio, nope
      const interiorsSameSLER = ringsSameSLER.filter(r => interiors.includes(r))
      if (interiorsSameSLER.length > 0) return false

      return true
    }

    // interior rings that aren't inside the exterior nor
    // overlapping with different SWE
    if (!ringsInsideOf.includes(exterior)) {
      if (!ringsDiffSLER.includes(exterior)) return false
    }

    // interior rings inside another interior, nope
    if (ringsInsideOf.some(r => interiors.includes(r))) return false

    // overlapping interiors with different sweep line orientation, nope
    const interiorsDiffSLER = ringsDiffSLER.filter(r => interiors.includes(r))
    if (interiorsDiffSLER.length > 0) return false

    return true
  }
}

class Poly {
  constructor (geomPoly, multiPoly) {
    this.exteriorRing = new Ring(geomPoly[0], true, this)
    this.interiorRings = geomPoly.slice(1).map(rg => new Ring(rg, false, this))
    this.multiPoly = multiPoly
  }

  get sweepEvents () {
    return [].concat(
      this.exteriorRing.sweepEvents,
      ...this.interiorRings.map(r => r.sweepEvents)
    )
  }

  /* Given a segment with these rings, is that segment inside this polygon? */
  isInside (ringsOnEdgeOf, ringsInsideOf) {
    const onEdgeOf = ringsOnEdgeOf.filter(r => r.poly === this)
    const insideOf = ringsInsideOf.filter(r => r.poly === this)

    // anything on an edge can't be inside
    if (onEdgeOf.length > 0) return false

    // we need to be inside the exterior, and nothing else
    if (insideOf.length !== 1 || !insideOf[0].isExterior) return false

    return true
  }
}

class MultiPoly {
  constructor (geomMultiPoly) {
    this.polys = geomMultiPoly.map(gmp => new Poly(gmp, this))
  }

  get sweepEvents () {
    return [].concat(...this.polys.map(p => p.sweepEvents))
  }
}

module.exports = { Ring, Poly, MultiPoly }
