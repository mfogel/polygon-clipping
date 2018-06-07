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
        <p>
          polygon-clipping {{performance}} m/s</br>
          martinez {{martinezPerf}} m/s
        </p>

      </div>
    </div>
  </div>
</template>

<script>
var pc = require("../../main");
var martinez = require("martinez-polygon-clipping");

var operation = pc.intersection;
var martinezOp = martinez.intersection;
var inData = null;
var inLayer = null;
var outLayer = null;
var map = null;

import asia from "../../test/fixtures/asia-with-poly.geojson";
import parallel from "../../test/end-to-end/almost-parrallel-segments/args.geojson";
import cheese from "../../test/end-to-end/saw-and-cheese/args.geojson";

const asiaGJ = JSON.parse(asia);
const parallelGJ = JSON.parse(parallel);
const cheeseGJ = JSON.parse(cheese);

export default {
  name: "app",
  data() {
    return {
      operations: ["Intersection", "Union", "Difference", "XOR"],
      selectedOperation: "Intersection",
      performance: "",
      martinezPerf: ""
    };
  },
  methods: {
    setInput(e) {
      inLayer.clearLayers();
      outLayer.clearLayers();
      if (e.target.value === "Asia") inData = asiaGJ;
      if (e.target.value === "Almost Parallel Segments") inData = parallelGJ;
      if (e.target.value === "Saw & Cheese") inData = cheeseGJ;
      inLayer.addData(inData);
      map.fitBounds(inLayer.getBounds(), {
        padding: [20, 20]
      });
      this.runOperation();
    },
    setOperation(e) {
      this.selectedOperation = e.target.value;
      outLayer.clearLayers();

      if (this.selectedOperation === "Union") {
        operation = pc.union;
        martinezOp = martinez.union;
      }
      if (this.selectedOperation === "Intersection") {
        operation = pc.intersection;
        martinezOp = martinez.intersection;
      }
      if (this.selectedOperation === "XOR") {
        operation = pc.xor;
        martinezOp = martinez.xor;
      }
      if (this.selectedOperation === "Difference") {
        operation = pc.difference;
        martinezOp = martinez.diff;
      }

      this.runOperation();
    },
    runOperation() {
      var t0 = performance.now();
      var outData = operation(
        inData.features[0].geometry.coordinates,
        inData.features[1].geometry.coordinates
      );
      this.performance = (performance.now() - t0).toFixed(2);

      outLayer
        .addData({
          type: "MultiPolygon",
          coordinates: outData
        })
        .addTo(map);

      var m0 = performance.now();
      martinezOp(
        inData.features[0].geometry.coordinates,
        inData.features[1].geometry.coordinates
      );
      this.martinezPerf = (performance.now() - m0).toFixed(2);
    }
  },
  mounted() {
    inData = asiaGJ;
    map = window.map = L.map("map", {
      minZoom: 1,
      maxZoom: 20,
      center: [0, 0],
      zoom: 2,
      crs: L.CRS.Simple
    });

    inLayer = L.geoJson(asiaGJ).addTo(map);

    map.fitBounds(inLayer.getBounds(), {
      padding: [20, 20]
    });
    outLayer = L.geoJson(
      {
        type: "FeatureCollection",
        features: []
      },
      {
        color: "red"
      }
    ).addTo(map);

    this.runOperation();
  }
};
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
