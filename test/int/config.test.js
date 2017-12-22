const BluebirdPromise = require('bluebird');
const GlobalPromise = Promise;
		// describe('configurability', () => {
		// 	it('can configure sendAsJson off', () => {
		// 		sinon.spy(JSON, 'stringify');
		// 		fetchMock.config.sendAsJson = false;
		// 		fetchMock.mock('http://it.at.there/', {not: 'an object'});
		// 		try {
		// 			// it should throw as we're trying to respond with unstringified junk
		// 			// ideally we'd use a buffer in the test, but the browser and node APIs differ
		// 			fetch('http://it.at.there/')
		// 			expect(false).to.be.true;
		// 		} catch (e) {
		// 			expect(JSON.stringify.calledWith({not: 'an object'})).to.be.false;
		// 			JSON.stringify.restore();
		// 			fetchMock.config.sendAsJson = true;
		// 		}
		// 	});

		// 	it.skip('has includeContentLength off by default', done => {
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.has('content-length')).to.be.false;
		// 				done();
		// 			});
		// 	});

		// 	it('can configure includeContentLength on', done => {
		// 		fetchMock.config.includeContentLength = true;
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('17');
		// 				fetchMock.config.includeContentLength = false;
		// 				done();
		// 			});
		// 	});

		// 	it('includeContentLength can override the global setting to on', done => {
		// 		fetchMock.config.includeContentLength = true;
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}, includeContentLength: true});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('17');
		// 				fetchMock.config.includeContentLength = false;
		// 				done();
		// 			});
		// 	});

		// 	it('includeContentLength can override the global setting to off', done => {
		// 		fetchMock.config.includeContentLength = true;
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}, includeContentLength: false});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.has('content-length')).to.be.false;
		// 				fetchMock.config.includeContentLength = false;
		// 				done();
		// 			});
		// 	});

		// 	describe('fetch utility class implementations', () => {
		// 		const originalConfig = fetchMock.config;

		// 		const getHeadersSpy = () => {
		// 			const spy = function (config) {
		// 				spy.callCount += 1;
		// 				if (config) {
		// 					return new originalConfig.Headers(config);
		// 				} else {
		// 					return new originalConfig.Headers();
		// 				}
		// 			};
		// 			spy.prototype = originalConfig.Headers;
		// 			spy.callCount = 0;
		// 			return spy;
		// 		}

		// 		const getResponseSpy = () => {
		// 			const spy = function (body, opts) {
		// 				spy.callCount += 1;
		// 				return new originalConfig.Response(body, opts);
		// 			};
		// 			spy.prototype = originalConfig.Response;
		// 			spy.callCount = 0;
		// 			return spy;
		// 		}

		// 		let defaultSpies = null;

		// 		beforeEach(() => {
		// 			defaultSpies = {
		// 				Headers: getHeadersSpy(),
		// 				Request: originalConfig.Request,
		// 				Response: getResponseSpy()
		// 			};

		// 			fetchMock.config = Object.assign({}, originalConfig, defaultSpies);
		// 		});

		// 		afterEach(() => {
		// 			fetchMock.restore();
		// 			fetchMock.config = originalConfig;
		// 		});

		// 		it('should use the configured Headers', () => {
		// 			const spiedReplacementHeaders = getHeadersSpy();
		// 			fetchMock.config.Headers = spiedReplacementHeaders;

		// 			fetchMock.mock('http://example.com/', {
		// 				status: 200,
		// 				headers: { id: 1 }
		// 			});

		// 			return fetch('http://example.com/').then(() => {
		// 				expect(spiedReplacementHeaders.callCount).to.equal(1);
		// 				expect(defaultSpies.Headers.callCount).to.equal(0);
		// 			});
		// 		});

		// 		it('should use the configured Response', () => {
		// 			const spiedReplacementResponse = sinon.stub().returns({ isFake: true });
		// 			fetchMock.config.Response = spiedReplacementResponse;

		// 			fetchMock.mock('http://example.com/', { status: 200 });

		// 			return fetch('http://example.com/').then((response) => {
		// 				expect(response.isFake).to.equal(true);
		// 				expect(spiedReplacementResponse.callCount).to.equal(1);
		// 				expect(defaultSpies.Response.callCount).to.equal(0);
		// 			});
		// 		});

		// 		it('should use the configured Request', () => {
		// 			const ReplacementRequest = function (url) {
		// 				this.url = url;
		// 				this.method = 'GET';
		// 				this.headers = [];
		// 			};
		// 			fetchMock.config.Request = ReplacementRequest;

		// 			fetchMock.mock('http://example.com/', { status: 200 });

		// 			const requestInstance = new ReplacementRequest('http://example.com/');

		// 			// As long as this is successful, it's worked, as we've correctly
		// 			// matched the request against overridden prototype.
		// 			return fetch(requestInstance);
		// 		});
		// 	});

		// 	it('can be configured to use alternate Promise implementations', () => {
		// 		fetchMock.config.Promise = BluebirdPromise;
		// 		fetchMock
		// 			.mock('http://example.com', 200)
		// 		const fetchCall = fetch('http://example.com');
		// 		expect(fetchCall).to.be.instanceof(BluebirdPromise);
		// 		return fetchCall.then(() => {
		// 			fetchMock.restore();
		// 			fetchMock.config.Promise = Promise;
		// 		})

		// 	});
		// })

		// describe('includeContentLength', () => {
		// 	it('should work on body of type object', done => {
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}, includeContentLength: true});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('17');
		// 				done();
		// 			});
		// 	});

		// 	it('should work on body of type string', done => {
		// 		fetchMock.mock('http://it.at.there/', {body: 'Fetch-Mock rocks', includeContentLength: true});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('16');
		// 				done();
		// 			});
		// 	});

		// 	it('should not overrule explicit mocked content-length header', done => {
		// 		fetchMock.mock('http://it.at.there/', {
		// 			body: {
		// 				hello: 'world'
		// 			},
		// 			headers: {
		// 				'Content-Length': '100',
		// 			},
		// 			includeContentLength: true
		// 		});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('100');
		// 				done();
		// 			});
		// 	});

		// 	it('should be case-insensitive when checking for explicit content-length header', done => {
		// 		fetchMock.mock('http://it.at.there/', {
		// 			body: {
		// 				hello: 'world'
		// 			},
		// 			headers: {
		// 				'CoNtEnT-LeNgTh': '100',
		// 			},
		// 			includeContentLength: true
		// 		});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('100');
		// 				done();
		// 			});
		// 	});

		// });

	// 	it('works with global promise responses when using the global promise', () => {
	// 		const sbx = fetchMock
	// 			.sandbox()
	// 			.mock('http://example.com', GlobalPromise.resolve(200));

	// 		const responsePromise = sbx('http://example.com')
	// 		expect(responsePromise).to.be.instanceof(GlobalPromise);
	// 		return responsePromise.then(res => expect(res.status).to.equal(200));
	// 	});

	// 	it('works with custom promise responses when using the global promise', () => {
	// 		const sbx = fetchMock
	// 			.sandbox()
	// 			.mock('http://example.com', BluebirdPromise.resolve(200));

	// 		const responsePromise = sbx('http://example.com')
	// 		expect(responsePromise).to.be.instanceof(GlobalPromise);
	// 		return responsePromise.then(res => expect(res.status).to.equal(200));
	// 	});
