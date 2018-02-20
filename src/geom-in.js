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
