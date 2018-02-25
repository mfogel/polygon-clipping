class Operation {
  constructor () {
    this.types = {
      INTERSECTION: 0,
      UNION: 1,
      XOR: 2
    }
  }

  setType (type) {
    this.type = type
  }

  setMultiPolys (mps) {
    this.multiPolys = mps
  }
}

// global to register details about the operation on
const operation = new Operation()

module.exports = operation
