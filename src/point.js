const arePointsEqual = (a, b) => a[0] === b[0] && a[1] === b[1]

/* Cross Product of two vectors with first point at origin */
const crossProduct = (a, b) => a[0] * b[1] - a[1] * b[0]

/* Dot Product of two vectors with first point at origin */
const dotProduct = (a, b) => a[0] * b[0] + a[1] * b[1]

/* Comparator for two vectors with same starting point */
const compareVectorAngles = (basePoint, endPoint1, endPoint2) => {
  let v1 = [endPoint1[0] - basePoint[0], endPoint1[1] - basePoint[1]]
  let v2 = [endPoint2[0] - basePoint[0], endPoint2[1] - basePoint[1]]
  const kross = crossProduct(v1, v2)
  if (kross * kross < Number.EPSILON * Number.EPSILON) return 0
  return kross > 0 ? 1 : -1
}

const length = a => Math.sqrt(dotProduct(a, a))

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
  arePointsEqual,
  crossProduct,
  dotProduct,
  compareVectorAngles,
  cosineOfAngle,
  sineOfAngle
}
