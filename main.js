const doOperation = require('./src')
const operation = require('./src/operation')

const union = (geom1, geom2, ...moreGeoms) => {
  return doOperation(operation.types.UNION, geom1, geom2, ...moreGeoms)
}

const intersection = (geom1, geom2, ...moreGeoms) => {
  return doOperation(operation.types.INTERSECTION, geom1, geom2, ...moreGeoms)
}

const xor = (geom1, geom2, ...moreGeoms) => {
  return doOperation(operation.types.XOR, geom1, geom2, ...moreGeoms)
}

const difference = (subject, clipping) => {
  // Doing this in two passes for simplicity, at the expense of performance.
  // It is certainly possible to do this in one pass, PR's happily considered
  const inter = doOperation(operation.types.INTERSECTION, subject, clipping)
  if (inter.length === 0) return subject
  return doOperation(operation.types.XOR, subject, inter)
}

const clean = geom => {
  // note that INTERSECTION or XOR would work the same as UNION here
  return doOperation(operation.types.UNION, geom)
}

module.exports = { union, intersection, xor, difference, clean }
