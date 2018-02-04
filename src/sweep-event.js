const EdgeType = require('./edge-type')
const signedArea = require('./signed-area')

function SweepEvent (point, left, otherEvent, isSubject, edgeType) {
  // isLeft
  this.left = left

  this.point = point

  this.otherEvent = otherEvent

  this.isSubject = isSubject

  // edgeType
  this.type = edgeType || EdgeType.NORMAL

  // transInOut
  this.inOut = false

  // isOutsideOther
  this.otherInOut = false

  // Not needed, delete
  this.prevInResult = null

  // isInResult
  this.inResult = false

  // needed?
  this.resultInOut = false

  this.isExteriorRing = true
}

SweepEvent.prototype = {
  isBelow: function (p) {
    return this.left
      ? signedArea(this.point, this.otherEvent.point, p) > 0
      : signedArea(this.otherEvent.point, this.point, p) > 0
  },

  isAbove: function (p) {
    return !this.isBelow(p)
  },

  isVertical: function () {
    return this.point[0] === this.otherEvent.point[0]
  },

  clone: function () {
    var copy = new SweepEvent(
      this.point,
      this.left,
      this.otherEvent,
      this.isSubject,
      this.type
    )

    copy.inResult = this.inResult
    copy.prevInResult = this.prevInResult
    copy.isExteriorRing = this.isExteriorRing
    copy.inOut = this.inOut
    copy.otherInOut = this.otherInOut

    return copy
  }
}

module.exports = SweepEvent
