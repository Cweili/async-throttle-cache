import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const plugins = [
  resolve(),
  babel(),
];

export default [
  {
    input: 'async-throttle-cache.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
      {
        name: 'asyncThrottleCache',
        file: pkg.unpkg,
        format: 'umd',
      },
    ],
    plugins,
  },
];
