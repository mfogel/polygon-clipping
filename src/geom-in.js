import Segment from './segment'

export class RingIn {
  constructor (geomRing, poly, isExterior) {
    this.poly = poly
    this.isExterior = isExterior
    this.segments = []

    let prevPoint = geomRing[0]
    this.bbox = {
      ll: { x: prevPoint.x, y: prevPoint.y },
      ur: { x: prevPoint.x, y: prevPoint.y },
    }

    for (let i = 1, iMax = geomRing.length; i < iMax; i++) {
      let point = geomRing[i]
      // skip repeated points
      if (point.x == prevPoint.x && point.y == prevPoint.y) continue
      this.segments.push(Segment.fromRing(prevPoint, point, this))
      if (point.x < this.bbox.ll.x) this.bbox.ll.x = point.x
      if (point.y < this.bbox.ll.y) this.bbox.ll.y = point.y
      if (point.x > this.bbox.ur.x) this.bbox.ur.x = point.x
      if (point.y > this.bbox.ur.y) this.bbox.ur.y = point.y
      prevPoint = point
    }
    let point = geomRing[0]
    // add segment from last to first if last is not the same as first
    if (point.x !== prevPoint.x || point.y !== prevPoint.y) {
      this.segments.push(Segment.fromRing(prevPoint, point, this))
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
  constructor (geomMultiPoly) {
    this.polys = []
    this.bbox = {
      ll: { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY },
      ur: { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
    }
    for (let i = 0, iMax = geomMultiPoly.length; i < iMax; i++) {
      const poly = new PolyIn(geomMultiPoly[i], this)
      if (poly.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = poly.bbox.ll.x
      if (poly.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = poly.bbox.ll.y
      if (poly.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = poly.bbox.ur.x
      if (poly.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = poly.bbox.ur.y
      this.polys.push(poly)
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
