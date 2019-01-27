import Segment from './segment'

export class RingIn {
  constructor (geomRing, poly, isExterior) {
    this.poly = poly
    this.isExterior = isExterior
    this.segments = []

    let prevPoint = geomRing[0]
    for (let i = 1, iMax = geomRing.length; i < iMax; i++) {
      let point = geomRing[i]
      this.segments.push(Segment.fromRing(prevPoint, point, this))
      prevPoint = point
    }
    this.segments.push(Segment.fromRing(prevPoint, geomRing[0], this))
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
    this.interiorRings = []
    for (let i = 1, iMax = geomPoly.length; i < iMax; i++) {
      this.interiorRings.push(new RingIn(geomPoly[i], this, false))
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
    for (let i = 0, iMax = geomMultiPoly.length; i < iMax; i++) {
      this.polys.push(new PolyIn(geomMultiPoly[i], this))
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
