import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { writeFile, mkdir } from 'fs/promises';
import sourcemaps from 'rollup-plugin-sourcemaps';

function createPackageJson() {
	const pkg = { type: longFormatNames[process.env.FORMAT] };

	const location = `./dist/${process.env.FORMAT}`;

	return {
		name: 'createPackageJson',
		buildEnd: async () => {
			await mkdir(location, { recursive: true });
			await writeFile(`${location}/package.json`, JSON.stringify(pkg, null, 2));
		},
	};
}

const longFormatNames = {
	cjs: 'commonjs',
	esm: 'module',
};

export default {
	input: './src/index.js',
	output: {
		sourcemap: true,
		dir: `./dist/${process.env.FORMAT}`,
		entryFileNames: 'index.js',
		format: process.env.FORMAT,
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
					dest: `dist/${process.env.FORMAT}/types`,
				},
			],
		}),
		createPackageJson(),
	],
};
