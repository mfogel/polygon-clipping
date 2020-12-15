# Changelog

This project adheres to [Semantic Versioning](https://semver.org/).

## v0.15.2 (2020-12-15)

 * Update dependencies [#109](https://github.com/mfogel/polygon-clipping/pull/109)

## v0.15.1 (2020-07-08)

 * Bug fix [#99](https://github.com/mfogel/polygon-clipping/issues/99)

## v0.15.0 (2020-07-03)

 * Limit data structure depth [#97](https://github.com/mfogel/polygon-clipping/issues/97)

## v0.14.3 (2019-10-26)

 * Bug fixes: [#78](https://github.com/mfogel/polygon-clipping/issues/78), [#79](https://github.com/mfogel/polygon-clipping/issues/79), [#80](https://github.com/mfogel/polygon-clipping/issues/80), [#81](https://github.com/mfogel/polygon-clipping/issues/81), [#82](https://github.com/mfogel/polygon-clipping/issues/82), [#85](https://github.com/mfogel/polygon-clipping/issues/85)

## v0.14.2 (2019-07-27)

 * Add typescript declarations [#76](https://github.com/mfogel/polygon-clipping/issues/76)
 * Upgrade project dependencies

## v0.14.1 (2019-05-14)

 * Upgrade splaytree dependency [#72](https://github.com/mfogel/polygon-clipping/issues/72)

## v0.14.0 (2019-03-30)

 * Change winding rule from [even-odd](https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule) to [non-zero](https://en.wikipedia.org/wiki/Nonzero-rule) ([#57](https://github.com/mfogel/polygon-clipping/issues/57))
 * Performance improvements ([#55](https://github.com/mfogel/polygon-clipping/issues/55))
 * Bug fixes (more instances of [#60](https://github.com/mfogel/polygon-clipping/issues/60))

## v0.13.0 (2019-02-26)

 * Performance improvements: [Rounder() module](https://github.com/mfogel/polygon-clipping/commit/59b6713d4e72eedf23d64d0ac2a51c84ddce1df7)
 * Bug fixes (more instances of [#60](https://github.com/mfogel/polygon-clipping/issues/60), [#69](https://github.com/mfogel/polygon-clipping/issues/69))

## v0.12.3 (2019-02-14)

 * Bug fixes ([#60](https://github.com/mfogel/polygon-clipping/issues/60) again, [#62](https://github.com/mfogel/polygon-clipping/issues/62) again, [#68](https://github.com/mfogel/polygon-clipping/issues/68))

## v0.12.2 (2019-01-29)

 * Add an unminified UMD to builds
 * Minimize builds to only required files

## v0.12.1 (2019-01-29)

 * Fix error in release process of v0.12.0

## v0.12.0 (2019-01-29)

 * Bug fixes ([#65](https://github.com/mfogel/polygon-clipping/issues/65), [#66](https://github.com/mfogel/polygon-clipping/issues/66))
 * Better packaging, switch to rollup ([#67](https://github.com/mfogel/polygon-clipping/issues/67))
 * Upgrade development dependencies

## v0.11.1 (2019-01-20)

 * Bug fixes ([#60](https://github.com/mfogel/polygon-clipping/issues/60), [#61](https://github.com/mfogel/polygon-clipping/issues/61), [#62](https://github.com/mfogel/polygon-clipping/issues/62))
 * Fix package vulnerabilities ([#63](https://github.com/mfogel/polygon-clipping/issues/63))

## v0.11 (2019-01-13)

 * Support IE11
 * Bug fixes ([#37](https://github.com/mfogel/polygon-clipping/issues/37), [#58](https://github.com/mfogel/polygon-clipping/issues/58), [#59](https://github.com/mfogel/polygon-clipping/issues/59), [#60](https://github.com/mfogel/polygon-clipping/issues/60))

## v0.10 (2019-01-07)

 * Support polygons with infinitely thin sections ([#48](https://github.com/mfogel/polygon-clipping/issues/48))
 * Performance improvements ([#31](https://github.com/mfogel/polygon-clipping/issues/31))
 * Bug fixes ([#41](https://github.com/mfogel/polygon-clipping/issues/41), [#49](https://github.com/mfogel/polygon-clipping/issues/49), [#51](https://github.com/mfogel/polygon-clipping/issues/51), [#53](https://github.com/mfogel/polygon-clipping/issues/53), [#54](https://github.com/mfogel/polygon-clipping/issues/54))

## v0.9.2 (2018-11-24)

 * Don't overwrite globals ([#50](https://github.com/mfogel/polygon-clipping/issues/50))

## v0.9.1 (2018-11-12)

 * Bug fixes ([#36](https://github.com/mfogel/polygon-clipping/issues/36) again, [#44](https://github.com/mfogel/polygon-clipping/issues/44))

## v0.9 (2018-10-17)

 * Performance improvements ([#26](https://github.com/mfogel/polygon-clipping/issues/26))
 * Bug fixes ([#36](https://github.com/mfogel/polygon-clipping/issues/36), [#38](https://github.com/mfogel/polygon-clipping/issues/38))

## v0.8 (2018-08-30)

 * Export a default es6 module ([#33](https://github.com/mfogel/polygon-clipping/issues/33))
 * Allow self-crossing rings using [even-odd rule](https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule) ([#30](https://github.com/mfogel/polygon-clipping/issues/30))
 * Fix bug with nearly vertical segments being split ([#29](https://github.com/mfogel/polygon-clipping/issues/29))
 * Fix bug with coincident segments being split slightly differently ([#22](https://github.com/mfogel/polygon-clipping/issues/22))

## v0.7 (2018-06-06)

 * Fix bug with overlapping segments ([#19](https://github.com/mfogel/polygon-clipping/issues/19))
 * Set up es6 imports ([#18](https://github.com/mfogel/polygon-clipping/issues/18))
 * Add [basic demo site](https://polygon-clipping.js.org/) ([#16](https://github.com/mfogel/polygon-clipping/issues/16))
 * Add benchmarks `npm run bench` ([#15](https://github.com/mfogel/polygon-clipping/issues/15))

## v0.6.1 (2018-04-01)

 * Performance improvements
 * Drop (within rounding error) infinitely thin rings from output ([#14](https://github.com/mfogel/polygon-clipping/issues/14))

## v0.6 (2018-03-26)

 * Ensure output rings are not self-intersecting ([#11](https://github.com/mfogel/polygon-clipping/issues/11))
 * Allow self-touching (but not crossing) input rings ([#10](https://github.com/mfogel/polygon-clipping/issues/10))
 * Support empty MultiPolygons as input
 * Performance improvements (reduced memory footprint and lower CPU time)
 * Handle segments with many coincidents ([#7](https://github.com/mfogel/polygon-clipping/issues/7))
 * Handle very thin input polygons ([#6](https://github.com/mfogel/polygon-clipping/issues/6))

## v0.5 (2018-03-01)

 * Remove `clean()` from module.exports ([#3](https://github.com/mfogel/polygon-clipping/issues/3))
 * Expand `difference()` operation to optionally take multiple clippings ([#1](https://github.com/mfogel/polygon-clipping/issues/1))
 * Use [splay-tree](https://github.com/w8r/splay-tree) instead of [avl](https://github.com/w8r/avl) to power the sweep line status tree ([#2](https://github.com/mfogel/polygon-clipping/issues/2))

## v0.4 (2018-02-27)

 * First release as new package after fork from [martinez](https://github.com/w8r/martinez)
