import operation from "./operation"

const union = (geom, ...moreGeoms) => operation.run("union", geom, moreGeoms)

const intersection = (geom, ...moreGeoms) =>
  operation.run("intersection", geom, moreGeoms)

const xor = (geom, ...moreGeoms) => operation.run("xor", geom, moreGeoms)

const difference = (subjectGeom, ...clippingGeoms) =>
  operation.run("difference", subjectGeom, clippingGeoms)

export default {
  union: union,
  intersection: intersection,
  xor: xor,
  difference: difference,
}
