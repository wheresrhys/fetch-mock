'use strict';

module.exports = function(karma) {
	karma.set({

		frameworks: [ 'mocha', 'chai', 'browserify'],
		files: [
			'http://polyfill.webservices.ft.com/v1/polyfill.min.js?libVersion=v1.3.0&features=default,modernizr:promises',
			'test/client.js'
		],
		preprocessors: {
			'test/client.js': ['browserify']
		},
		browserify: {
				transform: ['debowerify'],
				debug: true
		},
		browsers: ['PhantomJS'],
	});
};