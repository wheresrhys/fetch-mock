import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { writeFile, mkdir } from 'fs/promises';

function createCommonJsPackage() {
	const pkg = { type: 'commonjs' };

	return {
		name: 'cjs-package',
		buildEnd: async () => {
			await mkdir('./dist', { recursive: true });
			await writeFile('./dist/package.json', JSON.stringify(pkg, null, 2));
		},
	};
}

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
				},
			],
		}),
		createCommonJsPackage(),
	],
};
