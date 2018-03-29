const bbox = require('./bbox')

class Operation {
  constructor () {
    this.types = {
      INTERSECTION: 0,
      UNION: 1,
      XOR: 2,
      DIFFERENCE: 3
    }
  }

  register (type, geoms) {
    this.type = type
    this.numMultiPolys = geoms.length
    this.bbox = this._calcBbox(geoms)
  }

  _calcBbox (geoms) {
    const bboxes = []
    for (let i = 0, iMax = geoms.length; i < iMax; i++) {
      bboxes.push(bbox.getBboxForMultiPoly(geoms[i]))
    }
    // TODO: combine the bboxes together appropriately to form the opBbox
    const opBbox = [[0, 0], [0, 0]]
    return opBbox
  }
}

// global to register details about the operation on
const operation = new Operation()

module.exports = operation
