import { defineConfig } from 'vitest/config'

const configs = {
	browser: {
	  setupFiles: './test/setup/browser.js' ,
	  browser: {
	      enabled: true,
	      name: 'chrome', // browser name is required
	  },
	  server: {
	    deps: {
	      inline: [
	        "brace-expansion"
	      ]
	    }
	  }
	},

	server: {
		setupFiles: './test/setup/server.js'
	}
}

export default defineConfig({
  test: configs[process.env.TESTING_ENV || 'server']
})
