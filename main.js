import doIt from './src'
import operation from './src/operation'

export const union = (geom, ...moreGeoms) => {
  return doIt(operation.types.UNION, geom, moreGeoms)
}

export const intersection = (geom, ...moreGeoms) => {
  return doIt(operation.types.INTERSECTION, geom, moreGeoms)
}

export const xor = (geom, ...moreGeoms) => {
  return doIt(operation.types.XOR, geom, moreGeoms)
}

export const difference = (subjectGeom, ...clippingGeoms) => {
  return doIt(operation.types.DIFFERENCE, subjectGeom, clippingGeoms)
}
