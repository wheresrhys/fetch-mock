import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';

export default [
	{
		input: 'src/client.js',
		output: {
			file: 'esm/client.mjs',
			format: 'esm'
		},
		plugins: [resolve({preferBuiltins: false}), commonjs()]
	},
	{
		input: 'src/server.js',
		output: {
			file: 'esm/server.mjs',
			format: 'esm'
		},
		plugins: [resolve({preferBuiltins: true}), commonjs(), builtins(), globals()]
	},
	{
		input: 'es5/client-legacy.js',
		output: {
			file: 'es5/client-legacy-bundle.js',
			format: 'umd',
			name: 'fetchMock'
		},
		plugins: [json(), resolve({preferBuiltins: false}), commonjs(), builtins(), globals()]
	},
	{
		input: 'es5/client.js',
		output: {
			file: 'es5/client-bundle.js',
			format: 'umd',
			name: 'fetchMock'
		},
		plugins: [json(), resolve({preferBuiltins: false}), commonjs(), builtins(), globals()]
	}
];
