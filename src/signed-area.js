const { areVectorsParallel, crossProduct } = require('./point')

module.exports = (p0, p1, p2) => {
  const p20 = [p0[0] - p2[0], p0[1] - p2[1]]
  const p21 = [p1[0] - p2[0], p1[1] - p2[1]]
  // handles rounding error on calculation when crossProduct is very small
  if (areVectorsParallel(p20, p21)) return 0
  return crossProduct(p20, p21)
}
