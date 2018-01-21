'use strict';

module.exports = function(karma) {

	var configuration = {

		frameworks: [ 'mocha', 'chai'],
		files: [
			'test/client.js',
			'test/sw.js',
			{pattern: 'test/fixtures/built-sw.js', served: true, included: false},
		],
		proxies: {
			'/__sw.js': '/base/test/fixtures/built-sw.js'
		},
		preprocessors: {
			'test/**/*.js': ['webpack']
		},
		webpack: {
			devtool: 'source-map',
			module: {
				rules: [
					//babel
					{
						test: /\.js$/,
						loader: 'babel-loader',
						query: {
							babelrc: false, // ignore any .babelrc in project & dependencies
							cacheDirectory: true,
							plugins: [
								// ensures a module reqired multiple times is only transpiled once and
								// is shared by all that use it rather than transpiling it each time
								[require.resolve('babel-plugin-transform-runtime'),{
									helpers: true,
									polyfill: false,
								}],
							],
							presets: [require.resolve('babel-preset-env')]
						}
					}
				]
			}
		}
	};

	karma.set(configuration);

};
