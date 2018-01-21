'use strict';

module.exports = function(karma) {

	var configuration = {

		frameworks: [ 'mocha', 'chai'],
		files: [
			'test/client.js',
			{pattern: 'test/fixtures/sw.js', served: true, included: false},
		],
		proxies: {
			'/__sw.js': '/base/test/fixtures/sw.js'
		},
		preprocessors: {
			'test/**/*.js': ['webpack']
		},
		webpack: {
			// devtool: 'source-map',
			module: {
				rules: [
					{
						test: /\.js$/,
						loader: 'babel-loader',
						exclude: /node_modules/,
						query: {
							babelrc: false, // ignore any .babelrc in project & dependencies
							cacheDirectory: true,
							plugins: [
								// ensures a module reqired multiple times is only transpiled once and
								// is shared by all that use it rather than transpiling it each time
								[require.resolve('babel-plugin-transform-runtime'), {
									helpers: true,
									polyfill: true,
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
