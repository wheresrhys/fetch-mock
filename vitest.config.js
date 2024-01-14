import { defineConfig } from 'vitest/config';

const configs = {
	browser: {
		setupFiles: './test/setup/browser.js',
		environment: 'jsdom',
		// browser: {
		//     enabled: true,
		//     headless: true,
		//     name: 'chrome', // browser name is required
		// },
		// server: {
		//   deps: {
		//     inline: [
		//       "brace-expansion"
		//     ]
		//   }
		// }
	},

	server: {
		setupFiles: './test/setup/server.js',
		coverage: {
			provider: 'istanbul',
		},
	},
	['node-fetch']: {
		setupFiles: './test/setup/node-fetch.js',
	},
	commonjs: {
		setupFiles: './test/setup/commonjs.cjs',
	},
};

export default defineConfig({
	test: configs[process.env.TESTING_ENV || 'server'],
});
