import { nodeResolve } from "@rollup/plugin-node-resolve"
import { babel } from "@rollup/plugin-babel"
import { terser } from "rollup-plugin-terser"
import pkg from "./package.json"

export default [
  {
    input: "src/index.js",
    output: {
      name: "polygonClipping",
      file: pkg.browser,
      format: "umd",
    },
    plugins: [nodeResolve(), babel({ babelHelpers: "bundled" })],
  },
  {
    input: "src/index.js",
    output: {
      name: "polygonClipping",
      file: pkg.browser.replace(/.js$/, ".min.js"),
      format: "umd",
      sourcemap: true,
    },
    plugins: [nodeResolve(), babel({ babelHelpers: "bundled" }), terser()],
  },
  {
    input: "src/index.js",
    output: {
      file: pkg.main,
      format: "cjs",
      exports: "default",
    },
    plugins: [
      nodeResolve({ resolveOnly: ["robust-predicates"] }),
      babel({
        babelHelpers: "bundled",
        exclude: ["node_modules/**"],
      }),
    ],
  },
  {
    input: "src/index.js",
    output: {
      file: pkg.module,
      format: "es",
    },
    plugins: [
      babel({
        babelHelpers: "bundled",
        exclude: ["node_modules/**"],
      }),
    ],
    external: ["robust-predicates", "splaytree"],
  },
]
