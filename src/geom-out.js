const { compareVectorAngles } = require('./point')

class Ring {
  constructor (segment) {
    this.firstSegment = segment
    this.poly = null
    this._points = null
    this._claimSegments()
  }

  registerPoly (poly) {
    this.poly = poly
  }

  get geom () {
    // remove superfluous points (ie extra points along a straight line)
    const points = [this._points[0]]
    for (let i = 1; i < this._points.length - 1; i++) {
      const [prevPoint, point, nextPoint] = this._points.slice(i - 1, i + 2)
      if (compareVectorAngles(point, prevPoint, nextPoint) !== 0) {
        points.push(point)
      }
    }
    points.push(this._points[this._points.length - 1])
    return this.isExteriorRing ? points : points.reverse()
  }

  get enclosingRing () {
    if (this._enclosingRing === undefined) {
      this._enclosingRing = this._calcEnclosingRing()
    }
    return this._enclosingRing
  }

  get isExteriorRing () {
    if (!this.enclosingRing) return true
    if (!this.enclosingRing.enclosingRing) return false
    // an island in hole is a whole new polygon
    return this.enclosingRing.enclosingRing.isExteriorRing
  }

  /* Walk down the segments via the linked events, and claim the
   * segments that will be part of this ring */
  _claimSegments () {
    const segment = this.firstSegment
    let [prevEvent, event, nextEvent] = [null, segment.leftSE, segment.rightSE]
    this._points = [event.point]
    while (true) {
      prevEvent = event
      event = nextEvent

      this._points.push(event.point)
      event.segment.registerRingOut(this)

      const linkedEvents = event.availableLinkedEvents
      if (linkedEvents.length === 0) break
      if (linkedEvents.length === 1) nextEvent = linkedEvents[0].otherSE
      if (linkedEvents.length > 1) {
        const comparator = event.getLeftmostComparator(prevEvent)
        nextEvent = linkedEvents.sort(comparator)[0].otherSE
      }
    }
  }

  /* Returns the ring that encloses this one, if any */
  _calcEnclosingRing () {
    let prevSeg = this.firstSegment.prevInResult
    let prevPrevSeg = prevSeg ? prevSeg.prevInResult : null

    while (true) {
      // no segment found, thus no ring can enclose us
      if (!prevSeg) return null

      // no segments below prev segment found, thus the ring of the prev
      // segment must loop back around and enclose us
      if (!prevPrevSeg) return prevSeg.ringOut

      // if the two segments are of different rings, the ring of the prev
      // segment must either loop around us or the ring of the prev prev
      // seg, which would make us and the ring of the prev peers
      if (prevPrevSeg.ringOut !== prevSeg.ringOut) {
        if (prevPrevSeg.ringOut.enclosingRing !== prevSeg.ringOut) {
          return prevSeg.ringOut
        } else return prevSeg.ringOut.enclosingRing
      }

      // two segments are from the same ring, so this was a penisula
      // of that ring. iterate downward, keep searching
      prevSeg = prevPrevSeg.prevInResult
      prevPrevSeg = prevSeg ? prevSeg.prevInResult : null
    }
  }
}

class Poly {
  constructor (exteriorRing) {
    this.exteriorRing = exteriorRing
    exteriorRing.registerPoly(this)
    this.interiorRings = []
  }

  addInterior (ring) {
    this.interiorRings.push(ring)
    ring.registerPoly(this)
  }

  get geom () {
    return [this.exteriorRing.geom, ...this.interiorRings.map(r => r.geom)]
  }
}

class MultiPoly {
  constructor (rings) {
    this.rings = rings
  }

  get geom () {
    const polys = []
    this.rings.forEach(ring => {
      if (ring.poly) return
      if (ring.isExteriorRing) polys.push(new Poly(ring))
      else {
        if (!ring.enclosingRing.poly) polys.push(new Poly(ring.enclosingRing))
        ring.enclosingRing.poly.addInterior(ring)
      }
    })
    return [...polys.map(p => p.geom)]
  }
}

module.exports = { Ring, Poly, MultiPoly }
