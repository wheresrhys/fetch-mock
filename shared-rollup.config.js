import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
export default {
	input: './src/index.js',
	output: {
		dir: './dist',
		entryFileNames: 'commonjs.cjs',
		format: 'commonjs',
		exports: 'named',
	},
	plugins: [
		nodeResolve({ preferBuiltins: false }),
		commonjs(),
		// sourcemaps(),
		// builtins(),
		// globals(),
		copy({
			targets: [
				{
					src: './types/*.d.ts',
					dest: 'dist/types',
					rename: (name) => {
						return `${name}.cts`;
					},
				},
			],
		}),
	],
};
