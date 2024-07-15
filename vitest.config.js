import { defineConfig } from 'vitest/config';

const configs = {
	browser: {
		setupFiles: './packages/fetch-mock/test/setup/browser.js',
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
		setupFiles: './packages/fetch-mock/test/setup/server.js',
		coverage: {
			provider: 'istanbul',
		},
	},
	['node-fetch']: {
		setupFiles: './packages/fetch-mock/test/setup/node-fetch.js',
	},
	commonjs: {
		setupFiles: './packages/fetch-mock/test/setup/commonjs.cjs',
	},
	// packages: {
	// 	reporters: ['default', 'html'],
	// 	coverage: {
	// 		reporter: ['text', 'html', 'clover', 'json'],
	// 		provider: 'v8',
	// 		reportOnFailure: true,
	// 		enabled: true,
	// 	},
	// },
};

export default defineConfig({
	test: {...configs[process.env.TESTING_ENV || 'server'],
	exclude: [
    "packages/standalone/*.test.js",
    "packages/fetch-mock/test/framework-compat/jest.spec.js",
    '**/node_modules/**',
  ]
},


});
