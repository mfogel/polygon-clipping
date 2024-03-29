<template>
  <div id="map">
    <div class="control leaflet-bar">
      <h4>Input Data</h4>
      <select :disabled="!useData" @change="setInput">
        <option>Asia</option>
        <option>Almost Parallel Segments</option>
        <option>Saw & Cheese</option>
      </select>
      <br /><br />
      <div v-for="operation in operations" :key="operation">
        <input
          :checked="operation.name === selectedOperationName"
          type="radio"
          name="operation.name"
          :value="operation.name"
          @change="setOperation"
        />
        {{ operation.name }}
      </div>

      <h4>Performance</h4>
      <p>
        polygon-clipping {{ performance }} m/s<br />
        martinez {{ martinezPerf }} m/s<br />
        jsts {{ jstsPerf }} m/s<br />
      </p>
    </div>
  </div>
</template>

<script>
import pc from "../../src/index"
import { geomEach } from "@turf/meta"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import {
  union as martinezUnion,
  intersection as martinezIntersection,
  diff as martinezDifference,
  xor as martinezXor,
} from "martinez-polygon-clipping"

// turf v5 runs off of jsts under the hood
import jstsUnion from "@turf/union"
import jstsIntersection from "@turf/intersect"
import jstsDifference from "@turf/difference"
var jstsXor = null

var inData = null
var inLayer = null
var outLayer = null
var map = null
var jstsOp = null

import asia from "./assets/asia-with-poly.json"
import cheese from "./assets/cheese.json"
import parallel from "./assets/parallel.json"

export default {
  name: "App",
  data() {
    return {
      useData: true,
      operations: [
        {
          name: "Intersection",
          pcOperation: pc.intersection,
          martinezOperation: martinezIntersection,
          jstsOperation: jstsIntersection,
        },
        {
          name: "Union",
          pcOperation: pc.union,
          martinezOperation: martinezUnion,
          jstsOperation: jstsUnion,
        },
        {
          name: "Difference",
          pcOperation: pc.difference,
          martinezOperation: martinezDifference,
          jstsOperation: jstsDifference,
        },
        {
          name: "XOR",
          pcOperation: pc.xor,
          martinezOperation: martinezXor,
          jstsOperation: jstsXor,
        },
      ],
      selectedOperationName: "Intersection",
      performance: "",
      martinezPerf: "",
      jstsPerf: "",
    }
  },
  computed: {
    selectedOperation() {
      return this.operations.find((o) => o.name === this.selectedOperationName)
    },
  },
  async mounted() {
    if (window.location.hash !== "") {
      const hashString = window.location.hash.replace("#", "")
      let data = null
      if (hashString.indexOf("http") > -1) {
        const resp = await fetch(hashString)
        data = await resp.json()
      } else {
        try {
          data = await import(
            `../../test/end-to-end/${hashString}/args.geojson`
          )
        } catch (err) {
          console.log(err)
          data = asia
        }
      }
      this.useData = false
      inData = data
    } else {
      inData = asia
    }

    map = window.map = L.map("map", {
      minZoom: 1,
      maxZoom: 20,
      center: [0, 0],
      zoom: 2,
      crs: L.CRS.Simple,
    })

    inLayer = L.geoJson(inData).addTo(map)

    map.fitBounds(inLayer.getBounds(), {
      padding: [20, 20],
    })
    outLayer = L.geoJson(
      {
        type: "FeatureCollection",
        features: [],
      },
      {
        color: "red",
      },
    ).addTo(map)

    this.runOperation()
  },
  methods: {
    setInput(e) {
      inLayer.clearLayers()
      outLayer.clearLayers()
      if (e.target.value === "Asia") inData = asia
      if (e.target.value === "Almost Parallel Segments") inData = parallel
      if (e.target.value === "Saw & Cheese") inData = cheese
      inLayer.addData(inData)
      map.fitBounds(inLayer.getBounds(), {
        padding: [20, 20],
      })
      this.runOperation()
    },
    setOperation(e) {
      this.selectedOperationName = e.target.value
      outLayer.clearLayers()
      this.runOperation()
    },
    runOperation() {
      var t0 = performance.now()

      const geoms = []
      geomEach(inData, (geom) => {
        geoms.push(geom.coordinates)
      })
      var outData = this.selectedOperation.pcOperation(
        geoms[0],
        ...geoms.slice(1),
      )
      this.performance = (performance.now() - t0).toFixed(2)

      outLayer
        .addData({
          type: "MultiPolygon",
          coordinates: outData,
        })
        .addTo(map)

      var m0 = performance.now()
      this.selectedOperation.martinezOperation(
        inData.features[0].geometry.coordinates,
        inData.features[1].geometry.coordinates,
      )
      this.martinezPerf = (performance.now() - m0).toFixed(2)

      if (jstsOp !== null) {
        var j0 = performance.now()
        this.selectedOperation.jstsOperation(
          inData.features[0],
          inData.features[1],
        )
        this.jstsPerf = (performance.now() - j0).toFixed(2)
      } else {
        this.jstsPerf = "N/A"
      }
    },
  },
}
</script>

<style>
html,
body,
#app,
#map {
  width: 100%;
  height: 100%;
  margin: 0px;
}

.control {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 10px;
  z-index: 10000;
}

h4 {
  margin-bottom: 5px;
}
p {
  margin-top: 5px;
}
</style>
