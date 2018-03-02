const doOperation = require('./src')
const operation = require('./src/operation')

const union = (geom, ...moreGeoms) => {
  return doOperation(operation.types.UNION, geom, ...moreGeoms)
}

const intersection = (geom, ...moreGeoms) => {
  return doOperation(operation.types.INTERSECTION, geom, ...moreGeoms)
}

const xor = (geom, ...moreGeoms) => {
  return doOperation(operation.types.XOR, geom, ...moreGeoms)
}

const difference = (subjectGeom, ...clippingGeoms) => {
  return doOperation(operation.types.DIFFERENCE, subjectGeom, ...clippingGeoms)
}

module.exports = { union, intersection, xor, difference }
