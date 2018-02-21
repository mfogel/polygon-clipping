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

  setNumberOfGeoms (num) {
    this.numberOfGeoms = num
  }
}

// global to register details about the operation on
const operation = new Operation()

module.exports = operation
