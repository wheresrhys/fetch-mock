import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { writeFile, mkdir } from 'fs/promises';
function createCommonJsPackage() {
	const pkg = { type: 'commonjs' };

	return {
		name: 'cjs-package',
		buildEnd: async () => {
			await mkdir('./packages/fetch-mock/dist', { recursive: true });
			await writeFile('./packages/fetch-mock/dist/package.json', JSON.stringify(pkg, null, 2));
		},
	};
}

export default {
	input: 'packages/fetch-mock/src/index.js',
	output: {
		dir: 'packages/fetch-mock/dist',
		entryFileNames: 'commonjs.js',
		format: 'commonjs',
	},
	plugins: [
		nodeResolve({ preferBuiltins: false }),
		// resolve({ preferBuiltins: true }),
		commonjs(),
		createCommonJsPackage(),
		// sourcemaps(),
		// builtins(),
		// globals(),
	],
};
