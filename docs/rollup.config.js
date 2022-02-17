import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'
import css from 'rollup-plugin-postcss'

export default {
  input: 'src/main.js',
  output: {
    name: 'polygonClippingDocs',
    file: 'dist/bundle.js',
    format: 'iife',
    globals: {
      vue: 'Vue'
    },
    sourcemap: true
  },
  plugins: [
    resolve(),
    vue(),
    commonjs(),
    json(),
    css(),
    babel({
      babelHelpers: 'bundled',
      compact: true,
      configFile: '../babel.config.js',
    }),
    terser()
  ],
  external: ['vue']
}
