import rounder from './rounder'
import Segment from './segment'

export class RingIn {
  constructor (geomRing, poly, isExterior) {
    if (!Array.isArray(geomRing) || geomRing.length === 0) {
      throw new Error('Input geometry is not a valid Polygon or MultiPolygon')
    }

    this.poly = poly
    this.isExterior = isExterior
    this.segments = []

    if (typeof geomRing[0][0] !== 'number' || typeof geomRing[0][1] !== 'number') {
      throw new Error('Input geometry is not a valid Polygon or MultiPolygon')
    }

    const firstPoint = rounder.round(geomRing[0][0], geomRing[0][1])
    this.bbox = {
      ll: { x: firstPoint.x, y: firstPoint.y },
      ur: { x: firstPoint.x, y: firstPoint.y },
    }

    let prevPoint = firstPoint
    for (let i = 1, iMax = geomRing.length; i < iMax; i++) {
      if (typeof geomRing[i][0] !== 'number' || typeof geomRing[i][1] !== 'number') {
        throw new Error('Input geometry is not a valid Polygon or MultiPolygon')
      }
      let point = rounder.round(geomRing[i][0], geomRing[i][1])
      // skip repeated points
      if (point.x === prevPoint.x && point.y === prevPoint.y) continue
      this.segments.push(Segment.fromRing(prevPoint, point, this))
      if (point.x < this.bbox.ll.x) this.bbox.ll.x = point.x
      if (point.y < this.bbox.ll.y) this.bbox.ll.y = point.y
      if (point.x > this.bbox.ur.x) this.bbox.ur.x = point.x
      if (point.y > this.bbox.ur.y) this.bbox.ur.y = point.y
      prevPoint = point
    }
    // add segment from last to first if last is not the same as first
    if (firstPoint.x !== prevPoint.x || firstPoint.y !== prevPoint.y) {
      this.segments.push(Segment.fromRing(prevPoint, firstPoint, this))
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
}

export class PolyIn {
  constructor (geomPoly, multiPoly) {
    if (!Array.isArray(geomPoly)) {
      throw new Error('Input geometry is not a valid Polygon or MultiPolygon')
    }
    this.exteriorRing = new RingIn(geomPoly[0], this, true)
    // copy by value
    this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y },
    }
    this.interiorRings = []
    for (let i = 1, iMax = geomPoly.length; i < iMax; i++) {
      const ring = new RingIn(geomPoly[i], this, false)
      if (ring.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = ring.bbox.ll.x
      if (ring.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = ring.bbox.ll.y
      if (ring.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = ring.bbox.ur.x
      if (ring.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = ring.bbox.ur.y
      this.interiorRings.push(ring)
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
}

export class MultiPolyIn {
  constructor (geom, isSubject) {
    if (!Array.isArray(geom)) {
      throw new Error('Input geometry is not a valid Polygon or MultiPolygon')
    }

    try {
      // if the input looks like a polygon, convert it to a multipolygon
      if (typeof geom[0][0][0] === 'number') geom = [geom]
    } catch (ex) {
      // The input is either malformed or has empty arrays.
      // In either case, it will be handled later on.
    }

    this.polys = []
    this.bbox = {
      ll: { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY },
      ur: { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
    }
    for (let i = 0, iMax = geom.length; i < iMax; i++) {
      const poly = new PolyIn(geom[i], this)
      if (poly.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = poly.bbox.ll.x
      if (poly.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = poly.bbox.ll.y
      if (poly.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = poly.bbox.ur.x
      if (poly.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = poly.bbox.ur.y
      this.polys.push(poly)
    }
    this.isSubject = isSubject
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
