module.exports = (karma) =>
	karma.set({
		port: 9876,
		frameworks: ['mocha'],
		files: [
			'test/client-setup.js',
			process.env.TEST_SRC || 'test/{client-specs,specs}/*.test.js',
			{ pattern: 'test/fixtures/sw.js', served: true, included: false },
		],
		proxies: {
			'/__sw.js': '/base/test/fixtures/sw.js',
			// this just needs to be a 200 response, so can send any file
			'/dummy-file.txt': '/base/test/fixtures/sw.js',
		},
		preprocessors: {
			'test/**/*.js': ['webpack'],
		},
		webpack: {
			mode: 'development',
			devtool: 'inline-source-map',
		},
		reporters: ['mocha'],
	});
