const doOperation = require('./src/do-operation')
const operationTypes = require('./src/operation-types')

// TODO: expand to handle more than two polys
const union = (poly1, poly2) => {
  return doOperation(operationTypes.UNION, poly1, poly2)
}

// TODO: expand to handle more than two polys
const intersection = (poly1, poly2) => {
  operationTypes.setActive(operationTypes.INTERSECTION)
  return doOperation(operationTypes.INTERSECTION, poly1, poly2)
}

// TODO: expand to handle more than two polys
const xor = (poly1, poly2) => {
  operationTypes.setActive(operationTypes.XOR)
  return doOperation(operationTypes.XOR, poly1, poly2)
}

const difference = (subject, clipping) => {
  return doOperation(operationTypes.DIFFERENCE, subject, clipping)
}

const clean = poly => {
  // note that INTERSECTION or XOR would work the same as UNION here
  return doOperation(operationTypes.UNION, poly)
}

module.exports = { union, difference, xor, intersection, clean }
