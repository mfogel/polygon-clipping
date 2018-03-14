const doIt = require('./src')
const operation = require('./src/operation')

const union = (geom, ...moreGeoms) => {
  return doIt(operation.types.UNION, geom, moreGeoms)
}

const intersection = (geom, ...moreGeoms) => {
  return doIt(operation.types.INTERSECTION, geom, moreGeoms)
}

const xor = (geom, ...moreGeoms) => {
  return doIt(operation.types.XOR, geom, moreGeoms)
}

const difference = (subjectGeom, ...clippingGeoms) => {
  return doIt(operation.types.DIFFERENCE, subjectGeom, clippingGeoms)
}

module.exports = { union, intersection, xor, difference }
