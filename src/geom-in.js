class Ring {
  constructor (poly, isExterior) {
    this.poly = poly
    this.isExterior = isExterior
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

  /* If a segment is within the given array of rings,
   * is that segment within this polygon? */
  isInside (rings) {
    if (!rings.includes(this.exteriorRing)) return false
    if (this.interiorRings.some(r => rings.includes(r))) return false
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
