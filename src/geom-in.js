// Give rings unique ID's to get consistent sorting of segments
// and sweep events when all else is identical
let ringId = 0

class Ring {
  constructor (poly, isExterior) {
    this.id = ringId++
    this.poly = poly
    this.isExterior = isExterior
    this.isInterior = !isExterior
    if (isExterior) poly.setExteriorRing(this)
    else poly.addInteriorRing(this)
  }
}

class Poly {
  constructor (multipoly) {
    this.multipoly = multipoly
    this.exteriorRing = null
    this.interiorRings = []
    multipoly.addPoly(this)
  }

  setExteriorRing (ring) {
    this.exteriorRing = ring
  }

  addInteriorRing (ring) {
    this.interiorRings.push(ring)
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
  constructor () {
    this.polys = []
  }

  addPoly (poly) {
    this.polys.push(poly)
  }
}

module.exports = { Ring, Poly, MultiPoly }
