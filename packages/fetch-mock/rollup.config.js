import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { writeFile, mkdir } from 'fs/promises';
import sourcemaps from 'rollup-plugin-sourcemaps';

function createPackageJson(type, location) {
	const pkg = { type };

	return {
		name: 'createPackageJson',
		buildEnd: async () => {
			await mkdir(location, { recursive: true });
			await writeFile(`${location}/package.json`, JSON.stringify(pkg, null, 2));
		},
	};
}

const configs = {
	cjs: {
		input: './src/index.js',
		output: {
			sourcemap: true,
			dir: './dist/cjs',
			entryFileNames: 'index.js',
			format: 'cjs',
			exports: 'named',
		},
		plugins: [
			nodeResolve({ preferBuiltins: false }),
			commonjs(),
			sourcemaps(),
			copy({
				targets: [
					{
						src: './types/*.d.ts',
						dest: 'dist/cjs/types',
					},
				],
			}),
			createPackageJson('cjs', './dist/cjs'),
		],
	},

	esm: {
		input: './src/index.js',
		output: {
			sourcemap: true,
			dir: './dist/esm',
			entryFileNames: 'index.js',
			format: 'esm',
			exports: 'named',
		},
		plugins: [
			nodeResolve({ preferBuiltins: false }),
			commonjs(),
			copy({
				targets: [
					{
						src: './types/*.d.ts',
						dest: 'dist/esm/types',
					},
				],
			}),
			createPackageJson('module', './dist/esm'),
		],
	},
};

export default configs[process.env.FORMAT];
