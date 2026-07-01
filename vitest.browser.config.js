import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
	test: {
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: 'chromium' }],
		},
		exclude: [
			'packages/jest/src/__tests__/**',
			'packages/codemods/src/__tests__/**',
		],
	},
});
