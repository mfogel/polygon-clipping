/* eslint-env jest */

const fs = require('fs')
const path = require('path')
const load = require('load-json-file')
const polygonClipping = require('../main')

const endToEndDir = 'test/end-to-end'
const possibleOps = ['union', 'intersection', 'difference', 'xor']

/** USE ME TO ONLY RUN ONE TEST **/
const targetOnly = ''
const opOnly = ''

describe('end to end', () => {
  const targets = fs.readdirSync(endToEndDir)

  targets.forEach(target => {
    if (targetOnly && target !== targetOnly) return

    describe(target, () => {
      const targetDir = path.join(endToEndDir, target)
      const argsGeojson = load.sync(path.join(targetDir, 'args.geojson'))
      const args = argsGeojson.features.map(f => f.geometry.coordinates)

      possibleOps.forEach(op => {
        if (opOnly && op !== opOnly) return

        let resultGeojson
        try {
          resultGeojson = load.sync(path.join(targetDir, `${op}.geojson`))
        } catch (err) {
          /* missing result file indicates no need to test that operation */
          return
        }
        test(op, () => {
          const expected = resultGeojson.geometry.coordinates
          const result = polygonClipping[op](...args)
          expect(result).toEqual(expected)
        })
      })
    })
  })
})
