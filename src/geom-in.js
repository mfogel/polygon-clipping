import Segment from './segment'

// Give rings unique ID's to get consistent sorting of segments
// and sweep events when all else is identical
let ringId = 0

export class Ring {
  constructor (geomRing, poly) {
    this.id = ringId++
    this.poly = poly
    this.segments = []

    for (let i = 1, iMax = geomRing.length; i < iMax; i++) {
      this.segments.push(new Segment(geomRing[i - 1], geomRing[i], this))
    }
  }

  getSweepEvents () {
    const sweepEvents = []
    for (let i = 0, iMax = this.segments.length; i < iMax; i++) {
      const segment = this.segments[i]
      sweepEvents.push(segment.leftSE)
      sweepEvents.push(segment.rightSE)
    }
    return sweepEvents
  }

  get isExterior () {
    return this.poly.exteriorRing === this
  }

  get isInterior () {
    return this.poly.exteriorRing !== this
  }

  /* Given a segment on this rings with these relationships to other rings,
   * is it a valid segment of the ring's poly? */
  isValid (ringsSameSLER, ringsDiffSLER, ringsInsideOf) {
    const exterior = this.poly.exteriorRing
    const interiors = this.poly.interiorRings

    if (this === exterior) {
      // exterior segments inside or interior, nope
      for (let i = 0, iMax = ringsInsideOf.length; i < iMax; i++) {
        if (interiors.includes(ringsInsideOf[i])) return false
      }

      // overlap with an interior of same SWL orientatio, nope
      for (let i = 0, iMax = ringsSameSLER.length; i < iMax; i++) {
        if (interiors.includes(ringsSameSLER[i])) return false
      }

      return true
    }

    // interior rings that aren't inside the exterior nor
    // overlapping with different SWE
    if (!ringsInsideOf.includes(exterior)) {
      if (!ringsDiffSLER.includes(exterior)) return false
    }

    // interior rings inside another interior, nope
    for (let i = 0, iMax = ringsInsideOf.length; i < iMax; i++) {
      if (interiors.includes(ringsInsideOf[i])) return false
    }

    // overlapping interiors with different sweep line orientation, nope
    for (let i = 0, iMax = ringsDiffSLER.length; i < iMax; i++) {
      if (interiors.includes(ringsDiffSLER[i])) return false
    }

    return true
  }
}

export class Poly {
  constructor (geomPoly, multiPoly) {
    this.exteriorRing = new Ring(geomPoly[0], this)
    this.interiorRings = []
    for (let i = 1, iMax = geomPoly.length; i < iMax; i++) {
      this.interiorRings.push(new Ring(geomPoly[i], this))
    }
    this.multiPoly = multiPoly
  }

  getSweepEvents () {
    const sweepEvents = this.exteriorRing.getSweepEvents()
    for (let i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
      const ringSweepEvents = this.interiorRings[i].getSweepEvents()
      for (let j = 0, jMax = ringSweepEvents.length; j < jMax; j++) {
        sweepEvents.push(ringSweepEvents[j])
      }
    }
    return sweepEvents
  }

  /* Given a segment with these rings, is that segment inside this polygon? */
  isInside (ringsOnEdgeOf, ringsInsideOf) {
    // if we're on an edge, we can't be inside
    for (let i = 0, iMax = ringsOnEdgeOf.length; i < iMax; i++) {
      if (ringsOnEdgeOf[i].poly === this) return false
    }

    // we need to be inside the exterior, and nothing else
    let isInsideExterior = false
    for (let i = 0, iMax = ringsInsideOf.length; i < iMax; i++) {
      const ring = ringsInsideOf[i]
      if (ring.poly !== this) continue
      if (ring.isInterior) return false
      isInsideExterior = true
    }
    return isInsideExterior
  }
}

export class MultiPoly {
  constructor (geomMultiPoly) {
    this.polys = []
    for (let i = 0, iMax = geomMultiPoly.length; i < iMax; i++) {
      this.polys.push(new Poly(geomMultiPoly[i], this))
    }
    this.isSubject = false
  }

  markAsSubject () {
    this.isSubject = true
  }

  getSweepEvents () {
    const sweepEvents = []
    for (let i = 0, iMax = this.polys.length; i < iMax; i++) {
      const polySweepEvents = this.polys[i].getSweepEvents()
      for (let j = 0, jMax = polySweepEvents.length; j < jMax; j++) {
        sweepEvents.push(polySweepEvents[j])
      }
    }
    return sweepEvents
  }
}
