const { flpCompare, flpEQ } = require('./flp')

/* Cross Product of two vectors with first point at origin */
const crossProduct = (a, b) => a[0] * b[1] - a[1] * b[0]

/* Dot Product of two vectors with first point at origin */
const dotProduct = (a, b) => a[0] * b[0] + a[1] * b[1]

/* Comparator for two vectors with same starting point */
const compareVectorAngles = (basePt, endPt1, endPt2) => {
  const v1 = unitLength([endPt1[0] - basePt[0], endPt1[1] - basePt[1]])
  const v2 = unitLength([endPt2[0] - basePt[0], endPt2[1] - basePt[1]])
  const kross = crossProduct(v1, v2)
  return flpCompare(kross, 0)
}

const length = v => Math.sqrt(dotProduct(v, v))

const unitLength = v => {
  const l = length(v)
  if (flpEQ(l, 0)) throw new Error(`Cannot make unit vector from 0-length`)
  return [v[0] / l, v[1] / l]
}

/* Get the sine of the angle from pShared -> pAngle to pShaed -> pBase */
const sineOfAngle = (pShared, pBase, pAngle) => {
  const vBase = [pBase[0] - pShared[0], pBase[1] - pShared[1]]
  const vAngle = [pAngle[0] - pShared[0], pAngle[1] - pShared[1]]
  return crossProduct(vAngle, vBase) / length(vAngle) / length(vBase)
}

/* Get the cosine of the angle from pShared -> pAngle to pShaed -> pBase */
const cosineOfAngle = (pShared, pBase, pAngle) => {
  const vBase = [pBase[0] - pShared[0], pBase[1] - pShared[1]]
  const vAngle = [pAngle[0] - pShared[0], pAngle[1] - pShared[1]]
  return dotProduct(vAngle, vBase) / length(vAngle) / length(vBase)
}

module.exports = {
  crossProduct,
  dotProduct,
  compareVectorAngles,
  cosineOfAngle,
  sineOfAngle
}
