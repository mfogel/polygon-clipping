class MultiPoly {
  constructor (rings) {
    this.rings = rings
  }

  asPoints () {
    const result = []
    this.rings.forEach(ring => {
      // TODO: shouldn't the first ring always be an exterior one?
      if (ring.firstSegment.isExteriorRing || result.length === 0) {
        result.push([])
      }
      result[result.length - 1].push(ring.points)
    })
    return result
  }
}

module.exports = MultiPoly
