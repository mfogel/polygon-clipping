import { cmp } from './flp'

/* Cross Product of two vectors with first point at origin */
export const crossProduct = (a, b) => a.x * b.y - a.y * b.x

/* Dot Product of two vectors with first point at origin */
export const dotProduct = (a, b) => a.x * b.x + a.y * b.y

/* Comparator for two vectors with same starting point */
export const compareVectorAngles = (basePt, endPt1, endPt2) => {
  const v1 = { x: endPt1.x - basePt.x, y: endPt1.y - basePt.y }
  const v2 = { x: endPt2.x - basePt.x, y: endPt2.y - basePt.y }
  const kross = crossProduct(v1, v2)
  return cmp(kross, 0)
}

const length = v => Math.sqrt(dotProduct(v, v))

/* Get the sine of the angle from pShared -> pAngle to pShaed -> pBase */
export const sineOfAngle = (pShared, pBase, pAngle) => {
  const vBase = { x: pBase.x - pShared.x, y: pBase.y - pShared.y }
  const vAngle = { x: pAngle.x - pShared.x, y: pAngle.y - pShared.y }
  return crossProduct(vAngle, vBase) / length(vAngle) / length(vBase)
}

/* Get the cosine of the angle from pShared -> pAngle to pShaed -> pBase */
export const cosineOfAngle = (pShared, pBase, pAngle) => {
  const vBase = { x: pBase.x - pShared.x, y: pBase.y - pShared.y }
  const vAngle = { x: pAngle.x - pShared.x, y: pAngle.y - pShared.y }
  return dotProduct(vAngle, vBase) / length(vAngle) / length(vBase)
}
