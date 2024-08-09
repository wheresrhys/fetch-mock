import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'istanbul',
		},
		exclude: [
			'packages/standalone/*.test.js',
			'packages/fetch-mock/test/framework-compat/jest.spec.js',
			'**/node_modules/**',
		],
	},
});
