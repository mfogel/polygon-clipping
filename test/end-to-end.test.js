/* eslint-env jest */

import fs from 'fs'
import path from 'path'
import load from 'load-json-file'
import * as polygonClipping from '../main'

/** USE ME TO RUN ONLY ONE TEST **/
const targetOnly = ''
const opOnly = ''

/** USE ME TO SKIP TESTS **/
const targetsSkip = []
const opsSkip = []

const endToEndDir = 'test/end-to-end'

describe('end to end', () => {
  const targets = fs.readdirSync(endToEndDir)

  targets.forEach(target => {
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
        let doTest = test
        if (targetsSkip.includes(target)) doTest = test.skip
        if (opsSkip.includes(operationType)) doTest = test.skip
        if (targetOnly && opOnly) {
          if (target === targetOnly && operationType === opOnly) {
            doTest = test.only
          }
        } else if (targetOnly && target === targetOnly) doTest = test.only
        else if (opOnly && operationType === opOnly) doTest = test.only

        doTest(operationType, () => {
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
