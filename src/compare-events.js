const { arePointsColinear, arePointsEqual, comparePoints } = require('./point')

module.exports = (e1, e2) => {
  const p1 = e1.point
  const p2 = e2.point

  if (!arePointsEqual(p1, p2)) return comparePoints(p1, p2)

  // Same coordinates, but one is a left endpoint and the other is
  // a right endpoint. The right endpoint is processed first
  if (e1.isLeft !== e2.isLeft) return e1.isLeft ? 1 : -1

  if (!arePointsColinear(p1, e1.otherEvent.point, e2.otherEvent.point)) {
    // the event associate to the bottom segment is processed first
    return !e1.isBelow(e2.otherEvent.point) ? 1 : -1
  }

  // TODO: this looks suspicious....
  return !e1.isSubject && e2.isSubject ? 1 : -1
}
