# polygon-clipping

Apply boolean Polygon clipping operations (`intersection`, `union`, `difference`, `xor`) to your Polygons & MultiPolygons.

[![build](https://github.com/mfogel/polygon-clipping/workflows/build/badge.svg)](https://github.com/mfogel/polygon-clipping/actions?query=workflow%3Abuild)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/polygon-clipping.svg)](https://www.npmjs.com/package/polygon-clipping)


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
* rings may be self-touching and/or self-crossing. Self-crossing rings will be interpreted using the [non-zero rule](https://en.wikipedia.org/wiki/Nonzero-rule).
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

## Settings

Global settings are set via environment variables.

* **POLYGON_CLIPPING_MAX_QUEUE_SIZE** and **POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS**: Aims to prevent infinite loops - usually caused by floating-point math round-off errors. Defaults are 1,000,000.

## Changelog

This project adheres to [Semantic Versioning](https://semver.org/).

The full changelog is available at [CHANGELOG.md](https://github.com/mfogel/polygon-clipping/blob/master/CHANGELOG.md).

## Authors

* [Mike Fogel](https://github.com/mfogel)
* [Alexander Milevski](https://github.com/w8r)
* [Vladimir Ovsyannikov](https://github.com/sh1ng)

## Sponsors

 * [Alantgeo](https://www.alantgeo.com.au/)
 * [EasyTerritory](https://www.easyterritory.com/)

Please contact [Mike Fogel](https://github.com/mfogel) if you or your company is interested in sponsoring work on specific bug fixes or feature requests.

## Based on

* [A new algorithm for computing Boolean operations on polygons](paper.pdf) by Francisco Martinez, Antonio Jesus Rueda, Francisco Ramon Feito (2009)
