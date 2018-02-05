const EdgeType = require('./edge-type')
const signedArea = require('./signed-area')

function SweepEvent (point, isLeft, otherEvent, isSubject, edgeType) {
  this.isLeft = isLeft

  this.point = point

  this.otherEvent = otherEvent

  this.isSubject = isSubject

  this.edgeType = edgeType || EdgeType.NORMAL

  this.sweepLineEnters = true

  this.isInsideOther = false

  this.isInResult = false

  this.isExteriorRing = true
}

SweepEvent.prototype = {
  isBelow: function (p) {
    return this.isLeft
      ? signedArea(this.point, this.otherEvent.point, p) > 0
      : signedArea(this.otherEvent.point, this.point, p) > 0
  },

  isAbove: function (p) {
    return !this.isBelow(p)
  },

  isVertical: function () {
    return this.point[0] === this.otherEvent.point[0]
  }
}

module.exports = SweepEvent
