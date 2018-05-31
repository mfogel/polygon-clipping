class Operation {
  constructor () {
    this.types = {
      INTERSECTION: 0,
      UNION: 1,
      XOR: 2,
      DIFFERENCE: 3
    }
  }

  register (type, numMultiPolys) {
    this.type = type
    this.numMultiPolys = numMultiPolys
  }
}

// global to register details about the operation on
const operation = new Operation()

export default operation
