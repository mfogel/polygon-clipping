// global to register the request operation on
let activeOperationType = null

const operationTypes = {
  INTERSECTION: 0,
  UNION: 1,
  DIFFERENCE: 2,
  XOR: 3,
  setActive: type => (activeOperationType = type),
  isActive: type => type === activeOperationType
}

module.exports = operationTypes
