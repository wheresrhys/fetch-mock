import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';
// import sourcemaps from 'rollup-plugin-sourcemaps';

export default [
	{
		input: 'src/client.js',
		output: {
			file: 'esm/client.js',
			format: 'esm',
		},
		plugins: [
			resolve({ preferBuiltins: false, browser: true }),
			commonjs(),
			builtins(),
		],
	},
	{
		input: 'src/server.js',
		output: {
			file: 'esm/server.js',
			format: 'esm',
		},
		plugins: [
			resolve({ preferBuiltins: true }),
			commonjs(),
			// sourcemaps(),
			builtins(),
			globals(),
		],
	},
	{
		input: 'es5/client-legacy.js',
		output: {
			file: 'es5/client-legacy-bundle.js',
			format: 'umd',
			name: 'fetchMock',
		},
		plugins: [json(), resolve(), commonjs(), builtins(), globals()],
	},
	{
		input: 'es5/client.js',
		output: {
			file: 'es5/client-bundle.js',
			format: 'umd',
			name: 'fetchMock',
		},
		plugins: [
			json(),
			resolve({ preferBuiltins: false, browser: true }),
			commonjs(),
			builtins(),
			globals(),
		],
	},
];
