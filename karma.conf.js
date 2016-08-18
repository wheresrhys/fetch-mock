'use strict';

module.exports = function(karma) {
	var configuration = {

		frameworks: [ 'mocha', 'chai', 'browserify'],
		files: [
			'http://polyfill.webservices.ft.com/v2/polyfill.min.js?features=default,Promise,fetch',
			'test/client.js'
		],
		preprocessors: {
			'src/**/*.js': ['babel', 'browserify'],
			'test/**/*.js': ['babel', 'browserify']
		},
		browserify: {
			debug: true
		},
		babelPreprocessor: {
      options: {
        presets: ['es2015'],
        plugins: ['transform-object-assign'],
        sourceMap: 'inline'
      },
      // filename: function (file) {
      //   return file.originalPath.replace(/\.js$/, '.es5.js');
      // },
      // sourceFileName: function (file) {
      //   return file.originalPath;
      // }
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

