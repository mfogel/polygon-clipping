const splitAll = (bbox, geoms) => {
  const inBboxGeoms = []
  const outBboxGeoms = []
  for (let i = 0, iMax = geoms.length; i < iMax; i++) {
    const [inGeom, outGeom] = split(bbox, geoms[i])
    if (inGeom !== null) inBboxGeoms.push(inGeom)
    if (outGeom !== null) outBboxGeoms.push(outGeom)
  }
  return [inBboxGeoms, outBboxGeoms]
}

const split = (bbox, geom) => {
  return [geom, null]
}

const join = (inBboxGeom, outBboxGeoms) => {
  return inBboxGeom
}

module.exports = {
  join,
  split,
  splitAll
}
