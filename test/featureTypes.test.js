/* eslint-env jest */

const path = require('path')
const load = require('load-json-file')
const martinez = require('../src/')

const clipping = load.sync(
  path.join(__dirname, 'featureTypes', 'clippingPoly.geojson')
)
const outDir = path.join(__dirname, 'featureTypes', 'out')

const testScenarios = [
  {
    testName: 'polyToClipping',
    subjectPoly: 'poly'
  },
  {
    testName: 'polyWithHoleToClipping',
    subjectPoly: 'polyWithHole'
  },
  {
    testName: 'multiPolyToClipping',
    subjectPoly: 'multiPoly'
  },
  {
    testName: 'multiPolyWithHoleToClipping',
    subjectPoly: 'multiPolyWithHole'
  }
]

testScenarios.forEach(ts => {
  const subject = load.sync(
    path.join(__dirname, 'featureTypes', ts.subjectPoly + '.geojson')
  )

  const pInter = path.join(outDir, 'intersection', ts.testName + '.geojson')
  const pXor = path.join(outDir, 'xor', ts.testName + '.geojson')
  const pDiff = path.join(outDir, 'difference', ts.testName + '.geojson')
  const pUnion = path.join(outDir, 'union', ts.testName + '.geojson')

  describe(ts.testName, () => {
    test('intersection', () => {
      const expectedIntResult = load.sync(pInter)
      if (expectedIntResult.geometry.type === 'Polygon') {
        expectedIntResult.geometry.coordinates = [
          expectedIntResult.geometry.coordinates
        ]
      }
      const intResult = martinez.intersection(
        subject.geometry.coordinates,
        clipping.geometry.coordinates
      )
      expect(intResult).toEqual(expectedIntResult.geometry.coordinates)
    })

    test('xor', () => {
      const expectedXorResult = load.sync(pXor)
      if (expectedXorResult.geometry.type === 'Polygon') {
        expectedXorResult.geometry.coordinates = [
          expectedXorResult.geometry.coordinates
        ]
      }
      const xorResult = martinez.xor(
        subject.geometry.coordinates,
        clipping.geometry.coordinates
      )
      expect(xorResult).toEqual(expectedXorResult.geometry.coordinates)
    })

    test('difference', () => {
      const expectedDiffResult = load.sync(pDiff)
      if (expectedDiffResult.geometry.type === 'Polygon') {
        expectedDiffResult.geometry.coordinates = [
          expectedDiffResult.geometry.coordinates
        ]
      }
      const diffResult = martinez.difference(
        subject.geometry.coordinates,
        clipping.geometry.coordinates
      )
      expect(diffResult).toEqual(expectedDiffResult.geometry.coordinates)
    })

    test('Union', () => {
      const expectedUnionResult = load.sync(pUnion)
      if (expectedUnionResult.geometry.type === 'Polygon') {
        expectedUnionResult.geometry.coordinates = [
          expectedUnionResult.geometry.coordinates
        ]
      }
      const unionResult = martinez.union(
        subject.geometry.coordinates,
        clipping.geometry.coordinates
      )
      expect(unionResult).toEqual(expectedUnionResult.geometry.coordinates)
    })
  })
})
