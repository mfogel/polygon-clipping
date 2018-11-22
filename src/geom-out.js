import { compareVectorAngles } from './vector'
import SweepEvent from './sweep-event'

export class RingOut {
  /* Given the segments from the sweep line pass, compute & return a series
   * of closed rings from all the segments marked to be part of the result */
  static factory (allSegments) {
    const ringsOut = []

    for (let i = 0, iMax = allSegments.length; i < iMax; i++) {
      const segment = allSegments[i]
      if (!segment.isInResult() || segment.ringOut) continue

      let prevEvent = null
      let event = segment.leftSE
      let nextEvent = segment.rightSE
      const events = [event]

      const startingPoint = event.point
      const intersectionLEs = []

      /* Walk the chain of linked events to form a closed ring */
      while (true) {
        prevEvent = event
        event = nextEvent
        events.push(event)

        /* Is the ring complete? */
        if (event.point === startingPoint) break

        while (true) {
          const availableLEs = event.getAvailableLinkedEvents()

          /* Did we hit a dead end? This shouldn't happen. Indicates some earlier
           * part of the algorithm malfunctioned... please file a bug report. */
          if (availableLEs.length === 0) {
            const firstPt = events[0].point
            const lastPt = events[events.length - 1].point
            throw new Error(
              `Unable to complete output ring starting at [${firstPt.x},` +
                ` ${firstPt.y}]. Last matching segment found ends at` +
                ` [${lastPt.x}, ${lastPt.y}].`
            )
          }

          /* Only one way to go, so cotinue on the path */
          if (availableLEs.length === 1) {
            nextEvent = availableLEs[0].otherSE
            break
          }

          /* We must have an intersection. Check for a completed loop */
          let indexLE = null
          for (let j = 0, jMax = intersectionLEs.length; j < jMax; j++) {
            if (intersectionLEs[j].point === event.point) {
              indexLE = j
              break
            }
          }
          /* Found a completed loop. Cut that off and make a ring */
          if (indexLE !== null) {
            const intersectionLE = intersectionLEs.splice(indexLE)[0]
            const ringEvents = events.splice(intersectionLE.index)
            ringEvents.unshift(ringEvents[0].otherSE)
            ringsOut.push(new RingOut(ringEvents.reverse()))
            continue
          }
          /* register the intersection */
          intersectionLEs.push({
            index: events.length,
            point: event.point,
          })
          /* Choose the left-most option to continue the walk */
          const comparator = event.getLeftmostComparator(prevEvent)
          nextEvent = availableLEs.sort(comparator)[0].otherSE
          break
        }
      }

      ringsOut.push(new RingOut(events))
    }
    return ringsOut
  }

  constructor (events) {
    this.events = events
    for (let i = 0, iMax = events.length; i < iMax; i++) {
      events[i].segment.ringOut = this
    }
    this.poly = null
  }

  getGeom () {
    // Remove superfluous points (ie extra points along a straight line),
    const points = [[this.events[0].point.x, this.events[0].point.y]]
    for (let i = 1, iMax = this.events.length - 1; i < iMax; i++) {
      const prevPt = this.events[i - 1].point
      const pt = this.events[i].point
      const nextPt = this.events[i + 1].point
      if (compareVectorAngles(pt, prevPt, nextPt) === 0) continue
      points.push([pt.x, pt.y])
    }

    // check if the starting point is necessary
    const prevPt = this.events[this.events.length - 2].point
    const pt = this.events[0].point
    const nextPt = this.events[1].point
    if (compareVectorAngles(pt, prevPt, nextPt) === 0) points.shift()

    // ring was all (within rounding error of angle calc) colinear points
    if (points.length === 0) return null

    points.push(points[0])
    return this.isExteriorRing() ? points : points.reverse()
  }

  isExteriorRing () {
    if (this._isExteriorRing === undefined) {
      const enclosing = this.enclosingRing()
      this._isExteriorRing = enclosing ? ! enclosing.isExteriorRing() : true
    }
    return this._isExteriorRing
  }

  enclosingRing () {
    if (this._enclosingRing === undefined) {
      this._enclosingRing = this._calcEnclosingRing()
    }
    return this._enclosingRing
  }

  /* Returns the ring that encloses this one, if any */
  _calcEnclosingRing () {
    // start with the ealier sweep line event so that the prevSeg
    // chain doesn't lead us inside of a loop of ours
    let leftMostEvt = this.events[0]
    for (let i = 1, iMax = this.events.length; i < iMax; i++) {
      const evt = this.events[i]
      if (SweepEvent.compare(leftMostEvt, evt) > 0) leftMostEvt = evt
    }

    let prevSeg = leftMostEvt.segment.prevInResult()
    let prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null

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
        if (prevPrevSeg.ringOut.enclosingRing() !== prevSeg.ringOut) {
          return prevSeg.ringOut
        } else return prevSeg.ringOut.enclosingRing()
      }

      // two segments are from the same ring, so this was a penisula
      // of that ring. iterate downward, keep searching
      prevSeg = prevPrevSeg.prevInResult()
      prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null
    }
  }
}

export class PolyOut {
  constructor (exteriorRing) {
    this.exteriorRing = exteriorRing
    exteriorRing.poly = this
    this.interiorRings = []
  }

  addInterior (ring) {
    this.interiorRings.push(ring)
    ring.poly = this
  }

  getGeom () {
    const geom = [this.exteriorRing.getGeom()]
    // exterior ring was all (within rounding error of angle calc) colinear points
    if (geom[0] === null) return null
    for (let i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
      const ringGeom = this.interiorRings[i].getGeom()
      // interior ring was all (within rounding error of angle calc) colinear points
      if (ringGeom === null) continue
      geom.push(ringGeom)
    }
    return geom
  }
}

export class MultiPolyOut {
  constructor (rings) {
    this.rings = rings
    this.polys = this._composePolys(rings)
  }

  getGeom () {
    const geom = []
    for (let i = 0, iMax = this.polys.length; i < iMax; i++) {
      const polyGeom = this.polys[i].getGeom()
      // exterior ring was all (within rounding error of angle calc) colinear points
      if (polyGeom === null) continue
      geom.push(polyGeom)
    }
    return geom
  }

  _composePolys (rings) {
    const polys = []
    for (let i = 0, iMax = rings.length; i < iMax; i++) {
      const ring = rings[i]
      if (ring.poly) continue
      if (ring.isExteriorRing()) polys.push(new PolyOut(ring))
      else {
        const enclosingRing = ring.enclosingRing()
        if (!enclosingRing.poly) polys.push(new PolyOut(enclosingRing))
        enclosingRing.poly.addInterior(ring)
      }
    }
    return polys
  }
}
