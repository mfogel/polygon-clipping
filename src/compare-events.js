const { arePointsColinear, comparePoints } = require('./point')

module.exports = (e1, e2) => {
  const pointCmp = comparePoints(e1.point, e2.point)
  if (pointCmp !== 0) return pointCmp

  // Same coordinates, but one is a left endpoint and the other is
  // a right endpoint. The right endpoint is processed first
  if (e1.isLeft !== e2.isLeft) return e1.isLeft ? 1 : -1

  if (!arePointsColinear(e1.point, e1.otherEvent.point, e2.otherEvent.point)) {
    // the event associate to the bottom segment is processed first
    return !e1.isBelow(e2.otherEvent.point) ? 1 : -1
  }

  // totally events
  if (e1.isSubject === e2.isSubject) return 0

  // favor the subject to come first
  return e1.isSubject ? -1 : 1
}
