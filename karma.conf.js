'use strict';

module.exports = function(karma) {
	var configuration = {

		frameworks: [ 'mocha', 'chai', 'browserify'],
		files: [
			'http://polyfill.webservices.ft.com/v1/polyfill.min.js?libVersion=v1.3.0&features=default,modernizr:promises',
			'test/client.js'
		],
		preprocessors: {
			'test/client.js': ['browserify']
		},
		browserify: {
			debug: true
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

