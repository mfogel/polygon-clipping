const { arePointsEqual } = require('./point')
const SweepEvent = require('./sweep-event')

class Segment {
  constructor (point1, point2, isSubject) {
    if (arePointsEqual(point1, point2)) {
      throw new Error('Unable to build segment for identical points')
    }

    this.isSubject = isSubject

    const [lp, rp] = [point1, point2].sort(SweepEvent.comparePoints)
    this.leftSE = new SweepEvent(lp, this)
    this.rightSE = new SweepEvent(rp, this)
  }

  getOtherSE (se) {
    if (se === this.leftSE) return this.rightSE
    if (se === this.rightSE) return this.leftSE
    throw new Error('may only be called by own sweep events')
  }
}

module.exports = Segment
