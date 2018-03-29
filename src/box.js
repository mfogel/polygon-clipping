const split = (bbox, geom, moreGeoms) => {
  const inBboxGeoms = [geom, ...moreGeoms]
  const outBboxGeoms = []
  return [inBboxGeoms, outBboxGeoms]
}

const join = (inBboxGeom, outBboxGeoms) => {
  return inBboxGeom
}

module.exports = {
  split,
  join
}
