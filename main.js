const doOperation = require('./src')
const operation = require('./src/operation')

const union = (geom1, geom2, ...more) => {
  return doOperation(operation.types.UNION, geom1, geom2, ...more)
}

const intersection = (geom1, geom2, ...more) => {
  return doOperation(operation.types.INTERSECTION, geom1, geom2, ...more)
}

const xor = (geom1, geom2, ...more) => {
  return doOperation(operation.types.XOR, geom1, geom2, ...more)
}

const difference = (subject, clipping, ...more) => {
  return doOperation(operation.types.DIFFERENCE, subject, clipping, ...more)
}

const clean = geom => {
  // note that INTERSECTION or XOR would work the same as UNION here
  return doOperation(operation.types.UNION, geom)
}

module.exports = { union, intersection, xor, difference, clean }
