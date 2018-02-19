const doOperation = require('./src/do-operation')
const operationTypes = require('./src/operation-types')

const union = (geom1, geom2, ...moreGeoms) => {
  return doOperation(operationTypes.UNION, geom1, geom2, ...moreGeoms)
}

const intersection = (geom1, geom2, ...moreGeoms) => {
  operationTypes.setActive(operationTypes.INTERSECTION)
  return doOperation(operationTypes.INTERSECTION, geom1, geom2, ...moreGeoms)
}

const xor = (geom1, geom2, ...moreGeoms) => {
  operationTypes.setActive(operationTypes.XOR)
  return doOperation(operationTypes.XOR, geom1, geom2, ...moreGeoms)
}

const difference = (subject, clipping) => {
  // Doing this in two passes for simplicity, at the expense of performance.
  // It is certainly possible to do this in one pass, PR's happily considered
  const inter = doOperation(operationTypes.INTERSECTION, subject, clipping)
  if (inter.length === 0) return subject
  return doOperation(operationTypes.XOR, subject, inter)
}

const clean = geom => {
  // note that INTERSECTION or XOR would work the same as UNION here
  return doOperation(operationTypes.UNION, geom)
}

module.exports = { union, difference, xor, intersection, clean }
