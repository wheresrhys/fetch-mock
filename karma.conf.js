module.exports = karma => karma.set({
	frameworks: [ 'mocha' ],
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
		devtool: 'source-map',
		module: {
			rules: [
				{
					test: /\.js$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					query: {
						babelrc: false, // ignore any .babelrc in project & dependencies
						cacheDirectory: true,
						plugins: ['transform-runtime'],
						presets: ['env']
					}
				}
			]
		}
	},
	reporters: ['mocha'],
});
