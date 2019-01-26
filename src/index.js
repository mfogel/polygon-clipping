import operation from './operation'

export const union = (geom, ...moreGeoms) =>
  operation.run('union', geom, moreGeoms)

export const intersection = (geom, ...moreGeoms) =>
  operation.run('intersection', geom, moreGeoms)

export const xor = (geom, ...moreGeoms) =>
  operation.run('xor', geom, moreGeoms)

export const difference = (subjectGeom, ...clippingGeoms) =>
  operation.run('difference', subjectGeom, clippingGeoms)
