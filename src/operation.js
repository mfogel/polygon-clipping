class Operation {
  constructor () {
    this.types = {
      INTERSECTION: 0,
      UNION: 1,
      XOR: 2,
      DIFFERENCE: 3
    }
  }

  setType (type) {
    this.type = type
  }

  setMultiPolys (mps) {
    this.multiPolys = mps
  }

  get subject () {
    // meaingful only for DIFFERENCE
    return this.multiPolys[0]
  }
}

// global to register details about the operation on
const operation = new Operation()

module.exports = operation
