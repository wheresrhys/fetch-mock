'use strict';

module.exports = function(karma) {
	var configuration = {

		frameworks: [ 'mocha', 'chai', 'browserify'],
		files: [
			'http://polyfill.webservices.ft.com/v2/polyfill.min.js?features=default,Promise,fetch',
			'test/client.js'
		],
		preprocessors: {
			'test/client.js': ['browserify']
		},
		browserify: {
			debug: true,
			transform: ['babelify']
		},
		browsers: ['Chrome'],
		customLaunchers: {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		}
	};

	if(process.env.TRAVIS){
		configuration.browsers = ['PhantomJS', 'Firefox', 'Chrome_travis_ci'];
	}

	karma.set(configuration);

};

