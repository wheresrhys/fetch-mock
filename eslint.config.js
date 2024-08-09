// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: [
			'docs/**/*.js',
			'packages/*/test/fixtures/*',
			'**/dist/**/*',
			'packages/fetch-mock/types/index.test-d.ts',
		],
	},
	{
		rules: {
			'no-prototype-builtins': 0
		},
		languageOptions: {
			globals: {
				...globals.node,
			}
		}
	},
	{
			files: [
				'import-compat/*',
				'**/*.cjs',
				'packages/fetch-mock/test/framework-compat/jest.spec.js',
				'packages/fetch-mock/test/fixtures/fetch-proxy.js'
			],
			rules: {
				'@typescript-eslint/no-require-imports': 0
			},

		},
		{
			files: ['packages/fetch-mock/test/**/*.js'],
			languageOptions: {globals: {
				testGlobals: 'writable',
			}},
		},
		{
			files: ['packages/fetch-mock/test/fixtures/sw.js'],
			languageOptions: {globals: {
				...globals.browser
			}},
		}
);

// module.exports = {
// 	env: {
// 		browser: true,
// 		es2021: true,
// 		node: true,
// 	},
// 	extends: ['origami-component', 'plugin:prettier/recommended'],

// 	],
// 	overrides: [
// 		{
// 			files: ['packages/*/test/**/*.js'],
// 			globals: {
// 				testGlobals: 'writable',
// 			},
// 			rules: {
// 				'class-methods-use-this': 0,
// 				'no-throw-literal': 0,
// 				'no-empty': 0,
// 				'no-console': 0,
// 				'prefer-promise-reject-errors': 0,
// 			},
// 		},
// 	parserOptions: {
// 		ecmaVersion: 'latest',
// 		sourceType: 'module',
// 	},
// 	rules: {
// 		'@lwc/lwc/no-async-await': 0,
// 		'jsdoc/require-param-description': 0,
// 		'jsdoc/require-returns-description': 0,
// 		'jsdoc/require-property-description': 0,
// 	},
// };
