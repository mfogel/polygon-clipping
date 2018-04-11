const fs = require('fs')
const path = require('path')
const load = require('load-json-file')
const Benchmark = require('benchmark')
const jstsUnion = require('@turf/union')
const w8r = require('martinez-polygon-clipping')
const mfogel = require('../main')

const options = {
  onStart (event) { console.log(this.name) },
  onError (event) { console.log(event.target.error) },
  onCycle (event) { console.log(String(event.target)) },
  onComplete() {
    console.log('- Fastest is ' + this.filter('fastest').map('name') + '\n')
  }
}

const hole_hole = load.sync('./bench/fixtures/hole_hole.geojson')
new Benchmark.Suite('Hole_Hole', options)
  .add('mfogel', () => {
    mfogel.union(
      hole_hole.features[0].geometry.coordinates,
      hole_hole.features[1].geometry.coordinates)
  })
  .add('w8r', () => {
    w8r.union(
      hole_hole.features[0].geometry.coordinates,
      hole_hole.features[1].geometry.coordinates)
  })
  .add('JSTS', () => {
    jstsUnion(hole_hole.features[0], hole_hole.features[1])
  })
  .run()

const asia = load.sync('./bench/fixtures/asia.geojson')
const unionPoly = load.sync('./bench/fixtures/asia_unionPoly.geojson')
new Benchmark.Suite('Asia union', options)
  .add('mfogel', () => {
    mfogel.union(
      asia.features[0].geometry.coordinates,
      unionPoly.geometry.coordinates)
  })
  .add('w8r', () => {
    w8r.union(
      asia.features[0].geometry.coordinates,
      unionPoly.geometry.coordinates)
  })
  .add('JSTS', () => jstsUnion(asia.features[0], unionPoly))
  .run()

const states = load.sync('./bench/fixtures/states_source.geojson')
new Benchmark.Suite('States clip', options)
  .add('mfogel', () => {
    mfogel.union(
      states.features[0].geometry.coordinates,
      states.features[1].geometry.coordinates)
  })
  .add('w8r', () => {
    w8r.union(
      states.features[0].geometry.coordinates,
      states.features[1].geometry.coordinates)
  })
  .add('JSTS', () => {
    jstsUnion(states.features[0], states.features[1])
  })
  .run()
