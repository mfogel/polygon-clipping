<template>
  <div id="app">
    <div id="map">
      <div class="control leaflet-bar">
        <h4>Input Data</h4>
        <select v-on:change="setInput">
          <option>Asia</option>
          <option>Almost Parallel Segments</option>
          <option>Saw & Cheese</option>
        </select>
        <br><br>
        <div v-for="operation in operations">
          <input type="radio" name="some" :value="operation" v-on:change="setOperation" v-model="selectedOperation"> {{operation}}
        </div>

        <h4>Performance</h4>
        <p>polygon-clipping {{performance}} m/s  </br>
        martinez {{martinezPerf}} m/s  </br>
        jsts {{jstsPerf}} m/s  </br>
        </p>      

      </div>
    </div>
  </div>
</template>

<script>

var pc = require('../../main')
var martinez = require('martinez-polygon-clipping')

var operation = pc.intersection
var martinezOp = martinez.intersection
var turfOperation = turf.intersect
var inData = null
var inLayer = null
var outLayer = null
var map = null

import asia from '../../test/fixtures/asia-with-poly.geojson'
import parallel from '../../test/end-to-end/almost-parrallel-segments/args.geojson'
import cheese from '../../test/end-to-end/saw-and-cheese/args.geojson'

const fc = JSON.parse(asia)
const fc2 = JSON.parse(parallel)
const fc3 = JSON.parse(cheese)

export default {
  name: 'app',
  data () {
    return {
      operations: ['Intersection', 'Union', 'Difference', 'XOR'],
      selectedOperation: 'Intersection',
      performance: '',
      martinezPerf: '',
      jstsPerf: ''
    }
  },
  methods: {
    setInput (e) {
      inLayer.clearLayers()
      outLayer.clearLayers()
      if (e.target.value === 'Asia') inData = fc
      if (e.target.value === 'Almost Parallel Segments') inData = fc2
      if (e.target.value === 'Saw & Cheese') inData = fc3
      inLayer.addData(inData)
      map.fitBounds(inLayer.getBounds(), {
        padding: [20, 20]
      })
      this.runOperation()
    },
    setOperation (e) {
      this.selectedOperation = e.target.value
      outLayer.clearLayers()

      if (this.selectedOperation === 'Union') {
        operation = pc.union
        martinezOp = martinez.union
        turfOperation = turf.union
      }
      if (this.selectedOperation === 'Intersection') {
        operation = pc.intersection
        martinezOp = martinez.intersection
        turfOperation = turf.intersect
      }
      if (this.selectedOperation === 'XOR') {
        operation = pc.xor
        martinezOp = martinez.xor
        turfOperation = null
      }
      if (this.selectedOperation === 'Difference') {
        operation = pc.difference
        martinezOp = martinez.diff
        turfOperation = turf.difference
      }

      this.runOperation()
    },
    runOperation () {
      var t0 = performance.now()
      var outData = operation(inData.features[0].geometry.coordinates, inData.features[1].geometry.coordinates)
      this.performance = (performance.now() - t0).toFixed(2)

      outLayer.addData({
        'type': 'MultiPolygon',
        'coordinates': outData
      }).addTo(map)

      var m0 = performance.now()
      martinezOp(inData.features[0].geometry.coordinates, inData.features[1].geometry.coordinates)
      this.martinezPerf = (performance.now() - m0).toFixed(2)

      if (turfOperation !== null) {
        var j0 = performance.now()
        turfOperation(inData.features[0], inData.features[1])
        this.jstsPerf = (performance.now() - j0).toFixed(2)
      } else {
        this.jstsPerf = 'N/A'
      }
    }
  },
  mounted () {
    inData = fc
    map = window.map = L.map('map', {
      minZoom: 1,
      maxZoom: 20,
      center: [0, 0],
      zoom: 2,
      crs: L.CRS.Simple
    })

    inLayer = L.geoJson(fc).addTo(map)

    map.fitBounds(inLayer.getBounds(), {
      padding: [20, 20]
    })
    outLayer = L.geoJson({
      type: 'FeatureCollection',
      features: []
    }, {
      color: 'red'
    }).addTo(map)

    this.runOperation()
  }
}
</script>

<style>
    html, body, #app, #map {
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

  h4{
    margin-bottom: 5px
  }
  p{
    margin-top: 5px;
  }
</style>
