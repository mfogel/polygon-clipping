**NOTE: This project is under active dev. The features described below may or may not exist yet.**

# polygon-clipping

Apply boolean Polygon clipping operations (`intersection`, `union`, `difference`, `xor`) to your Polygons & MultiPolygons.

[![npm version](https://img.shields.io/npm/v/polygon-clipping.svg)](https://www.npmjs.com/package/polygon-clipping)
[![build status](https://img.shields.io/travis/mfogel/polygon-clipping.svg)](https://travis-ci.org/mfogel/polygon-clipping)
[![test coverage](https://img.shields.io/coveralls/mfogel/polygon-clipping/master.svg)](https://coveralls.io/r/mfogel/polygon-clipping)


## Quickstart

```javascript
const polygonClipping = require('polygon-clipping')

const poly1 = [[[0,0],[2,0],[0,2],[0,0]]]
const poly2 = [[[-1,0],[1,0],[0,1],[-1,0]]]

polygonClipping.union       (poly1, poly2 /* , poly3, ... */)
polygonClipping.intersection(poly1, poly2 /* , poly3, ... */)
polygonClipping.xor         (poly1, poly2 /* , poly3, ... */)

polygonClipping.difference(poly1, poly2)

polygonClipping.clean(poly1)
```

## API

```javascript
/* two or more [multi]polygon(s) as input */
polygonClipping.union       (<geom>, <geom>, [ <geom>, ... ])
polygonClipping.intersection(<geom>, <geom>, [ <geom>, ... ])
polygonClipping.xor         (<geom>, <geom>, [ <geom>, ... ])

/* exactly two [multi]polygons as input */
polygonClipping.difference(<geom>, <geom>)

/* exactly one [multi]polygon as input */
polygonClipping.clean(<geom>)
```

### Input

Each positional argument (`<geom>`) may be either a Polygon or a MultiPolygon.

#### Polygon

Follows the [GeoJSON Polygon spec](https://tools.ietf.org/html/rfc7946#section-3.1.6), with the following notes/modifications:
* rings of the polygon are not required to be self-closing
* winding order of rings of Polygon does not matter
* interior rings may extend outside exterior rings (portion of interior ring outside exterior ring is dropped)
* interior rings may touch or overlap each other
* rings may be self-intersecting (interior sub-ring of rings are dropped)

#### MultiPolygon

Follows the [GeoJSON MultiPolygon spec](https://tools.ietf.org/html/rfc7946#section-3.1.7), with the following notes/modifications:
* may contain touching or overlapping Polygons

### Output

Always a MultiPolygon containing one or more non-overlapping, non-edge-sharing Polygons. The Polygons will follow the GeoJSON spec, meaning:
* the outer ring will be wound counter-clockwise, and inner rings clockwise.
* inner rings will not extend outside the outer ring, nor share an edge with the outer ring
* inner rings will not overlap, nor share an edge with each other
* rings will be self-closing
* rings will not be self-intersecting

In the event that the result of the operation is the empty set, the output will be an empty array: `[]`.

## Correctness / Tests

Run: `npm test`

The tests are broken up into unit tests and end-to-end tests. The end-to-end tests are organized as GeoJSON files, to make them easy to visualize thanks to [GitHub's helpful rendering of GeoJSON files](https://help.github.com/articles/mapping-geojson-files-on-github/). Browse those tests [here](test/end-to-end).

## Performance / Benchmark

Run: `npm run bench`

The Martinez-Rueda-Feito polygon clipping algorithm is used to compute the result in `O((n+k)*log(n))` time, where `n` is the total number of edges in all polygons involved and `k` is the number of intersections between edges.

## Authors

* [Mike Fogel](https://github.com/mfogel)
* [Alexander Milevski](https://github.com/w8r)
* [Vladimir Ovsyannikov](https://github.com/sh1ng)

## Based on

* [A new algorithm for computing Boolean operations on polygons](paper.pdf) by Francisco Martinez, Antonio Jesus Rueda, Francisco Ramon Feito (2009)
