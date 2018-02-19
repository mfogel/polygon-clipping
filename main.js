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
  // Doing this in two passes for simplicity, at the expense of performance.
  // It is certainly possible to do this in one pass, PR's happily considered
  const inter = doOperation(operationTypes.INTERSECTION, subject, clipping)
  if (inter.length === 0) return subject
  return doOperation(operationTypes.XOR, subject, inter)
}

const clean = poly => {
  // note that INTERSECTION or XOR would work the same as UNION here
  return doOperation(operationTypes.UNION, poly)
}

module.exports = { union, difference, xor, intersection, clean }
