const intersection = require('./segment-intersection')

module.exports = (p0, p1, p2) => {
  // avoid rounding error b/t intersection calculation and triangle area calc
  const inters = intersection(p0, p1, p0, p2)
  if (inters.length === 2) return 0
  return (p0[0] - p2[0]) * (p1[1] - p2[1]) - (p1[0] - p2[0]) * (p0[1] - p2[1])
}
