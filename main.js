import doIt from './src'
import operation from './src/operation'

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

export default {
  union: union,
  intersection: intersection,
  xor: xor,
  difference: difference,
}
