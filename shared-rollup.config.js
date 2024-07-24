import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
export default {
	input: './src/index.js',
	output: {
		dir: './dist',
		entryFileNames: 'commonjs.js',
		format: 'commonjs',
	},
	plugins: [
		nodeResolve({ preferBuiltins: false }),
		commonjs(),
		// sourcemaps(),
		// builtins(),
		// globals(),
	],
};
