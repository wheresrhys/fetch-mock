import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		browser: {
			enabled: true,
			provider: 'playwright',
			instances: [{ browser: 'chromium' }],
		},
		exclude: [
			'packages/jest/src/__tests__/**',
			'packages/codemods/src/__tests__/**',
		],
	},
});
