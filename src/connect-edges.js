const { cosineOfAngle, sineOfAngle } = require('./point')

const getNextSegment = (segments, prevPoint, point) => {
  const candidates = segments.filter(
    seg => !seg.isProcessed && seg.isAnEndpoint(point)
  )
  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  // we want the candidate that makes the smallest left-side angle
  // pre-compute the sine and cosine for each candidate
  candidates.forEach(cand => {
    const candPoint = cand.getOtherPoint(point)
    cand.sine = sineOfAngle(point, prevPoint, candPoint)
    cand.cosine = cosineOfAngle(point, prevPoint, candPoint)
  })

  // compare function that favors the smallest left-side angle
  const compareCandidates = (a, b) => {
    if (a.sine >= 0 && b.sine >= 0) {
      if (a.cosine === b.cosine) return 0
      return a.cosine > b.cosine ? -1 : 1
    }
    if (a.sine < 0 && b.sine < 0) {
      if (a.cosine === b.cosine) return 0
      return a.cosine < b.cosine ? -1 : 1
    }
    return a.sine > b.sine ? -1 : 1
  }

  candidates.sort(compareCandidates)
  return candidates[0]
}

const buildRing = (segment, segments) => {
  let point = segment.leftSE.point
  const ring = [point]
  while (segment) {
    let prevPoint = point
    point = segment.getOtherPoint(point)
    ring.push(point)
    segment.markProcessed()
    segment = getNextSegment(segments, prevPoint, point)
  }
  return ring
}

const connectEdges = segments => {
  const result = []

  segments.forEach((segment, i) => {
    if (segment.isProcessed) return
    const ring = buildRing(segment, segments)
    // TODO: shouldn't the first ring always be an exterior one?
    if (segment.isExteriorRing || result.length === 0) result.push([])
    result[result.length - 1].push(ring)
  })

  return result
}

module.exports = connectEdges
