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

Each positional argument (`<geom>`) may be either a Polygon or a MultiPolygon. The [GeoJSON spec](https://tools.ietf.org/html/rfc7946#section-3.1) is followed, with the following notes/modifications:
* MultiPolygons may contain touching or overlapping Polygons.
* rings are not required to be self-closing.
* rings may contain repeated points, which are ignored.
* rings may be self-touching and/or self-crossing. Self-crossing rings will be interpreted using the [even-odd rule](https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule).
* winding order of rings does not matter.
* inner rings may extend outside their outer ring. The portion of inner rings outside their outer ring is dropped.
* inner rings may touch or overlap each other.

### Output

For non-empty results, output will always be a MultiPolygon containing one or more non-overlapping, non-edge-sharing Polygons. The [GeoJSON spec](https://tools.ietf.org/html/rfc7946#section-3.1) is followed, with the following notes/modifications:
* outer rings will be wound counter-clockwise, and inner rings clockwise.
* inner rings will not extend outside their outer ring.
* rings will not overlap, nor share an edge with each other.
* rings will be self-closing.
* rings will not contain repeated points.
* rings will not contain superfluous points (intermediate points along a straight line).
* rings will not be self-touching nor self-crossing.
* rings *may* touch each other, but *may not* cross each other.

In the event that the result of the operation is the empty set, output will be a MultiPolygon with no Polygons: `[]`.

## Correctness

Run: `npm test`

The tests are broken up into unit tests and end-to-end tests. The end-to-end tests are organized as GeoJSON files, to make them easy to visualize thanks to [GitHub's helpful rendering of GeoJSON files](https://help.github.com/articles/mapping-geojson-files-on-github/). Browse those tests [here](test/end-to-end).

## Performance

The Martinez-Rueda-Feito polygon clipping algorithm is used to compute the result in `O((n+k)*log(n))` time, where `n` is the total number of edges in all polygons involved and `k` is the number of intersections between edges.

## Changelog

### v0.11 (2019-01-13)

 * Support IE11
 * Bug fixes ([#37](https://github.com/mfogel/polygon-clipping/issues/37), [#58](https://github.com/mfogel/polygon-clipping/issues/58), [#59](https://github.com/mfogel/polygon-clipping/issues/59), [#60](https://github.com/mfogel/polygon-clipping/issues/60))

### v0.10 (2019-01-07)

 * Support polygons with infinitely thin sections ([#48](https://github.com/mfogel/polygon-clipping/issues/48))
 * Performance improvements ([#31](https://github.com/mfogel/polygon-clipping/issues/31))
 * Bug fixes ([#41](https://github.com/mfogel/polygon-clipping/issues/41), [#49](https://github.com/mfogel/polygon-clipping/issues/49), [#51](https://github.com/mfogel/polygon-clipping/issues/51), [#53](https://github.com/mfogel/polygon-clipping/issues/53), [#54](https://github.com/mfogel/polygon-clipping/issues/54))

### v0.9.2 (2018-11-24)

 * Don't overwrite globals ([#50](https://github.com/mfogel/polygon-clipping/issues/50))

### v0.9.1 (2018-11-12)

 * Bug fixes ([#36](https://github.com/mfogel/polygon-clipping/issues/36) again, [#44](https://github.com/mfogel/polygon-clipping/issues/44))

### v0.9 (2018-10-17)

 * Performance improvements ([#26](https://github.com/mfogel/polygon-clipping/issues/26))
 * Bug fixes ([#36](https://github.com/mfogel/polygon-clipping/issues/36), [#38](https://github.com/mfogel/polygon-clipping/issues/38))

### v0.8 (2018-08-30)

 * Export a default es6 module ([#33](https://github.com/mfogel/polygon-clipping/issues/33))
 * Allow self-crossing rings using [even-odd rule](https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule) ([#30](https://github.com/mfogel/polygon-clipping/issues/30))
 * Fix bug with nearly vertical segments being split ([#29](https://github.com/mfogel/polygon-clipping/issues/29))
 * Fix bug with coincident segments being split slightly differently ([#22](https://github.com/mfogel/polygon-clipping/issues/22))

### v0.7 (2018-06-06)

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
