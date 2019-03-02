import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'polygonClipping',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      resolve(),
      babel(),
    ]
  },
  {
    input: 'src/index.js',
    output: {
      name: 'polygonClipping',
      file: pkg.browser.replace(/.js$/, '.min.js'),
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      babel(),
      terser(),
    ]
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
    plugins: [
      babel({
        exclude: ['node_modules/**']
      }),
    ],
    external: ['splaytree'],
  }
]
