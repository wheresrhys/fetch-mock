'use strict';

module.exports = function(karma) {
	// if (process.env.BROWSER === 'ChromeHeadless') {
	// 	process.env.CHROME_BIN = require('puppeteer').executablePath()
	// }

	var configuration = {

		frameworks: [ 'mocha', 'chai', 'browserify'],
		files: [
			'http://cdn.polyfill.io/v2/polyfill.min.js?features=default,Promise,fetch,Array.prototype.map,Array.prototype.filter',
			'test/client.js',
			'test/sw.js',
			{pattern: 'test/fixtures/built-sw.js', served: true, included: false},
		],
		proxies: {
			'/__sw.js': '/base/test/fixtures/built-sw.js'
		},
		preprocessors: {
			'test/*.js': ['browserify']
		},
		browserify: {
			debug: true,
			transform: [
				['babelify', {
					'presets': ['es2015'],
					'plugins': ['transform-object-assign']
				}]
			]
		}
	};

	karma.set(configuration);

};

