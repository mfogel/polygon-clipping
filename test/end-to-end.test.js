/* eslint-env jest */

const fs = require('fs')
const path = require('path')
const load = require('load-json-file')
const polygonClipping = require('../main')

/** USE ME TO RUN ONLY ONE TEST **/
const targetOnly = ''
const opOnly = ''

const endToEndDir = 'test/end-to-end'

describe('end to end', () => {
  const targets = fs.readdirSync(endToEndDir)

  targets.forEach(target => {
    if (targetOnly && target !== targetOnly) return

    // ignore dotfiles like .DS_Store
    if (target.startsWith('.')) return

    describe(target, () => {
      const targetDir = path.join(endToEndDir, target)
      const argsGeojson = load.sync(path.join(targetDir, 'args.geojson'))
      const args = argsGeojson.features.map(f => f.geometry.coordinates)

      const resultPathsAndOperationTypes = fs
        .readdirSync(targetDir)
        .filter(fn => fn !== 'args.geojson' && fn.endsWith('.geojson'))
        .map(fn => [fn.slice(0, -'.geojson'.length), path.join(targetDir, fn)])

      resultPathsAndOperationTypes.forEach(([operationType, resultPath]) => {
        if (opOnly && operationType !== opOnly) return

        test(operationType, () => {
          const resultGeojson = load.sync(resultPath)
          const expected = resultGeojson.geometry.coordinates

          const operation = polygonClipping[operationType]
          if (!operation) {
            throw new Error(
              `Unknown operation '${operationType}'. Mispelling in filename of ${resultPath} ?`
            )
          }

          const result = operation(...args)
          expect(result).toEqual(expected)
        })
      })
    })
  })
})
