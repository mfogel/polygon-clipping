# polygon-clipping

Apply boolean Polygon clipping operations (`intersection`, `union`, `difference`, `xor`) to your Polygons & MultiPolygons.

[![npm version](https://img.shields.io/npm/v/polygon-clipping.svg)](https://www.npmjs.com/package/polygon-clipping)
[![build status](https://img.shields.io/travis/mfogel/polygon-clipping/master.svg)](https://travis-ci.org/mfogel/polygon-clipping)
[![test coverage](https://img.shields.io/coveralls/mfogel/polygon-clipping/master.svg)](https://coveralls.io/r/mfogel/polygon-clipping)


## Quickstart

```javascript
const polygonClipping = require('polygon-clipping')

const poly1 = [[[0,0],[2,0],[0,2],[0,0]]]
const poly2 = [[[-1,0],[1,0],[0,1],[-1,0]]]

polygonClipping.union       (poly1, poly2 /* , poly3, ... */)
polygonClipping.intersection(poly1, poly2 /* , poly3, ... */)
polygonClipping.xor         (poly1, poly2 /* , poly3, ... */)
polygonClipping.difference  (poly1, poly2 /* , poly3, ... */)
```

## API

```javascript
/* All functions take one or more [multi]polygon(s) as input */

polygonClipping.union       (<geom>, ...<geoms>)
polygonClipping.intersection(<geom>, ...<geoms>)
polygonClipping.xor         (<geom>, ...<geoms>)

/* The clipGeoms will be subtracted from the subjectGeom */
polygonClipping.difference(<subjectGeom>, ...<clipGeoms>)
```

### Input

Each positional argument (`<geom>`) may be either a Polygon or a MultiPolygon.

#### Polygon

Follows the [GeoJSON Polygon spec](https://tools.ietf.org/html/rfc7946#section-3.1.6), with the following notes/modifications:
* rings of the polygon are not required to be self-closing
* rings may contain repeated points (which are ignored)
* winding order of rings of Polygon does not matter
* interior rings may extend outside exterior rings (portion of interior ring outside exterior ring is dropped)
* interior rings may touch or overlap each other
* rings may touch themselves, but may **not** cross themselves. If a self-crossing ring is found, an exception will be thrown. To clean up self-crossing rings, you may want to use the [non-zero rule](https://en.wikipedia.org/wiki/Nonzero-rule) or the [even-odd rule](https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule).

#### MultiPolygon

Follows the [GeoJSON MultiPolygon spec](https://tools.ietf.org/html/rfc7946#section-3.1.7), with the following notes/modifications:
* may contain touching or overlapping Polygons

### Output

Always a MultiPolygon containing one or more non-overlapping, non-edge-sharing Polygons. The Polygons will follow the GeoJSON spec, meaning:
* the outer ring will be wound counter-clockwise, and inner rings clockwise.
* inner rings will not extend outside the outer ring, nor share an edge with the outer ring
* inner rings will not overlap, nor share an edge with each other
* rings will be self-closing
* rings will not contain repeated points
* rings will not contain superfluous points (intermediate points along a straight line)
* rings will not be self-touching nor self-crossing

In the event that the result of the operation is the empty set, the output will be an empty array: `[]`.

## Correctness

Run: `npm test`

The tests are broken up into unit tests and end-to-end tests. The end-to-end tests are organized as GeoJSON files, to make them easy to visualize thanks to [GitHub's helpful rendering of GeoJSON files](https://help.github.com/articles/mapping-geojson-files-on-github/). Browse those tests [here](test/end-to-end).

## Performance

The Martinez-Rueda-Feito polygon clipping algorithm is used to compute the result in `O((n+k)*log(n))` time, where `n` is the total number of edges in all polygons involved and `k` is the number of intersections between edges.

## Changelog

### v0.7.0 (2018-06-06)

 * Fix bug with overlapping segments ([#19](https://github.com/mfogel/polygon-clipping/issues/19))
 * Set up es6 imports ([#18](https://github.com/mfogel/polygon-clipping/issues/18))
 * Add [basic demo site](https://polygon-clipping.js.org/) ([#16](https://github.com/mfogel/polygon-clipping/issues/16))
 * Add benchmarks `npm run bench` ([#15](https://github.com/mfogel/polygon-clipping/issues/15))

### v0.6.1 (2018-04-01)

 * Performance improvements
 * Drop (within rounding error) infinitely thin rings from output ([#14](https://github.com/mfogel/polygon-clipping/issues/14))

### v0.6 (2018-03-26)

 * Ensure output rings are not self-intersecting ([#11](https://github.com/mfogel/polygon-clipping/issues/11))
 * Allow self-touching (but not crossing) input rings ([#10](https://github.com/mfogel/polygon-clipping/issues/10))
 * Support empty MultiPolygons as input
 * Performance improvements (reduced memory footprint and lower CPU time)
 * Handle segments with many coincidents ([#7](https://github.com/mfogel/polygon-clipping/issues/7))
 * Handle very thin input polygons ([#6](https://github.com/mfogel/polygon-clipping/issues/6))

### v0.5 (2018-03-01)

 * Remove `clean()` from module.exports ([#3](https://github.com/mfogel/polygon-clipping/issues/3))
 * Expand `difference()` operation to optionally take multiple clippings ([#1](https://github.com/mfogel/polygon-clipping/issues/1))
 * Use [splay-tree](https://github.com/w8r/splay-tree) instead of [avl](https://github.com/w8r/avl) to power the sweep line status tree ([#2](https://github.com/mfogel/polygon-clipping/issues/2))

### v0.4 (2018-02-27)

 * First release as new package after fork from [martinez](https://github.com/w8r/martinez)

## Authors

* [Mike Fogel](https://github.com/mfogel)
* [Alexander Milevski](https://github.com/w8r)
* [Vladimir Ovsyannikov](https://github.com/sh1ng)

## Based on

* [A new algorithm for computing Boolean operations on polygons](paper.pdf) by Francisco Martinez, Antonio Jesus Rueda, Francisco Ramon Feito (2009)
