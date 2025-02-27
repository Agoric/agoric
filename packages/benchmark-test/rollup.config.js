import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'benchmark.test.js', 
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'bundle',
    sourcemap: false,
  },
  plugins: [
    resolve(),
    commonjs(), 
  ],
};

