module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: ['origami-component', 'plugin:prettier/recommended'],
	overrides: [
		{
			files: ['packages/*/test/**/*.js'],
			globals: {
				testGlobals: 'writable',
			},
			rules: {
				'class-methods-use-this': 0,
				'no-throw-literal': 0,
				'no-empty': 0,
				'no-console': 0,
				'prefer-promise-reject-errors': 0,
			},
		},
	],

	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'@lwc/lwc/no-async-await': 0,
	},
};
