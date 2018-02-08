const { arePointsEqual } = require('./point')
const SweepEvent = require('./sweep-event')

class Segment {
  constructor (point1, point2, isSubject) {
    if (arePointsEqual(point1, point2)) {
      throw new Error('Unable to build segment for identical points')
    }

    const [lp, rp] = [point1, point2].sort(SweepEvent.comparePoints)
    this.leftSE = new SweepEvent(lp, isSubject, this)
    this.rightSE = new SweepEvent(rp, isSubject, this)

    // TODO: maybe not set these and make traversal go through segment?
    this.leftSE.otherEvent = this.rightSE
    this.rightSE.otherEvent = this.leftSE
  }
}

module.exports = Segment
