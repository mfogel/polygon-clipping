/* eslint no-console: "off" */

import { default as load } from "load-json-file"
import { default as Benchmark } from "benchmark"
import { default as jstsUnion } from "@turf/union"
import { default as w8r } from "martinez-polygon-clipping"
import { default as mfogel } from "polygon-clipping"

/**
 * Benchmark results ( c9b02e5 )
 *
 * Hole_Hole
 * mfogel x 5,155 ops/sec ±0.56% (92 runs sampled)
 * w8r x 37,182 ops/sec ±1.05% (95 runs sampled)
 * JSTS x 2,259 ops/sec ±6.95% (84 runs sampled)
 * - Fastest is w8r
 *
 * Asia union
 * mfogel x 5.81 ops/sec ±2.74% (18 runs sampled)
 * w8r x 13.05 ops/sec ±4.98% (37 runs sampled)
 * JSTS x 8.71 ops/sec ±5.38% (26 runs sampled)
 * - Fastest is w8r
 *
 * States clip
 * mfogel x 98.03 ops/sec ±1.78% (72 runs sampled)
 * w8r x 284 ops/sec ±4.36% (84 runs sampled)
 * JSTS x 112 ops/sec ±2.20% (82 runs sampled)
 * - Fastest is w8r
 */

const options = {
  onStart() {
    console.log(this.name)
  },
  onError(event) {
    console.log(event.target.error)
  },
  onCycle(event) {
    console.log(String(event.target))
  },
  onComplete() {
    console.log("- Fastest is " + this.filter("fastest").map("name") + "\n")
  },
}

const holeHole = load.sync("./fixtures/hole_hole.geojson")
new Benchmark.Suite("Hole_Hole", options)
  .add("mfogel", () => {
    mfogel.union(
      holeHole.features[0].geometry.coordinates,
      holeHole.features[1].geometry.coordinates,
    )
  })
  .add("w8r", () => {
    w8r.union(
      holeHole.features[0].geometry.coordinates,
      holeHole.features[1].geometry.coordinates,
    )
  })
  .add("JSTS", () => {
    jstsUnion(holeHole.features[0], holeHole.features[1])
  })
  .run()

const asia = load.sync("./fixtures/asia.geojson")
const unionPoly = load.sync("./fixtures/asia_unionPoly.geojson")
new Benchmark.Suite("Asia union", options)
  .add("mfogel", () => {
    mfogel.union(
      asia.features[0].geometry.coordinates,
      unionPoly.geometry.coordinates,
    )
  })
  .add("w8r", () => {
    w8r.union(
      asia.features[0].geometry.coordinates,
      unionPoly.geometry.coordinates,
    )
  })
  .add("JSTS", () => jstsUnion(asia.features[0], unionPoly))
  .run()

const states = load.sync("./fixtures/states_source.geojson")
new Benchmark.Suite("States clip", options)
  .add("mfogel", () => {
    mfogel.union(
      states.features[0].geometry.coordinates,
      states.features[1].geometry.coordinates,
    )
  })
  .add("w8r", () => {
    w8r.union(
      states.features[0].geometry.coordinates,
      states.features[1].geometry.coordinates,
    )
  })
  .add("JSTS", () => {
    jstsUnion(states.features[0], states.features[1])
  })
  .run()
