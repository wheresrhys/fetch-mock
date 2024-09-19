// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
	{
		ignores: [
			'docs/**/*.js',
			'packages/*/test/fixtures/*',
			'packages/**/__test__/fixtures/*',
			'**/dist/**/*',
			'packages/fetch-mock/types/index.test-d.ts',
		],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended.map((config) => {
		return { ...config, ignores: ['packages/codemods/**'] };
	}),
	eslintConfigPrettier,
	{
		rules: {
			'no-prototype-builtins': 0,
			'@typescript-eslint/no-wrapper-object-types': 0,
		},
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	{
		files: [
			'import-compat/*',
			'**/*.cjs',
			'packages/fetch-mock/test/fixtures/fetch-proxy.js',
		],
		rules: {
			'@typescript-eslint/no-require-imports': 0,
		},
	},
	{
		files: ['packages/fetch-mock/test/**/*.js'],
		languageOptions: {
			globals: {
				testGlobals: 'writable',
			},
		},
	},
	{
		files: ['packages/fetch-mock/test/fixtures/sw.js'],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
	},
	eslintPluginPrettierRecommended,
];
