import Segment from './segment'
import { cleanRing } from './clean-input'
import { cmpPoints } from './flp'
import { compareVectorAngles } from './vector'

const min = Math.min
const max = Math.max


// Give rings unique ID's to get consistent sorting of segments
// and sweep events when all else is identical
let ringId = 0

function isPointUncessary (prevPt, pt, nextPt) {
  return cmpPoints(prevPt, pt) === 0 ||
  cmpPoints(pt, nextPt) === 0 ||
  compareVectorAngles(pt, prevPt, nextPt) === 0
}



export class Ring {
  constructor (geomRing, poly, bbox, queue) {
    this.id = ringId++
    this.poly = poly
    this.segments = []

    // Ensure ring is closed
    if (cmpPoints(geomRing[0], geomRing[geomRing.length - 1]) !== 0) {
      ring.push([geomRing[0], geomRing[1]])
    }

    let i = 1
    while (i < geomRing.length - 1) {
      // if (isPointUncessary(geomRing[i - 1], geomRing[i], geomRing[i + 1])) {
      //   geomRing.splice(i, 1)
      // } else {

        bbox[0] = min(bbox[0], geomRing[i][0])
        bbox[1] = min(bbox[1], geomRing[i][1])
        bbox[2] = max(bbox[2], geomRing[i][0])
        bbox[3] = max(bbox[3], geomRing[i][1])

        const seg = new Segment(
          { x: geomRing[i - 1][0], y: geomRing[i - 1][1] }, 
          { x: geomRing[i][0], y: geomRing[i][1] }, 
          this)
       this.segments.push(seg)
       queue.insert(seg.leftSE)
       queue.insert(seg.rightSE)

        i++
      // }
    }
    const seg = new Segment(
      { x: geomRing[0][0], y: geomRing[0][1] }, 
      { x: geomRing[geomRing.length - 2][0], y: geomRing[geomRing.length - 2][1] }, 
      this)
    this.segments.push(seg)
    queue.insert(seg.leftSE)
    queue.insert(seg.rightSE)
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
  constructor (geomPoly, multiPoly, bbox, queue) {
    
    if (geomPoly[0].length < 4) throw new Error(`Input polygon ring has less than 3 vertices`)

    this.exteriorRing = new Ring(geomPoly[0], this, bbox, queue)
    this.interiorRings = []

    for (let i = 1, iMax = geomPoly.length; i < iMax; i++) {
      if (geomPoly[i].length < 4 && geomPoly[i].length > 0) geomPoly.splice(i, 1)
      else this.interiorRings.push(new Ring(geomPoly[i], this, bbox, queue))
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
  constructor (geomMultiPoly, bbox, queue) {
    this.polys = []
    for (let i = 0, iMax = geomMultiPoly.length; i < iMax; i++) {
      this.polys.push(new Poly(geomMultiPoly[i], this, bbox, queue))
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
