const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');
const BluebirdPromise = require('bluebird');
const NativePromise = Promise;

module.exports = fetchMock => {
	describe('custom implementations', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		afterEach(() => fm.restore());

		describe('Promise', () => {
			it('can be configured to use alternate Promise implementations', async () => {
				fm.config.Promise = BluebirdPromise;
				fm.mock('http://example.com/', 200);
				const fetchCall = fetch('http://example.com');
				expect(fetchCall).to.be.instanceof(BluebirdPromise);
				await fetchCall;
				fm.config.Promise = NativePromise;
			});

			it('should allow non-native Promises as responses', async () => {
				fm.config.Promise = BluebirdPromise;
				const stub = sinon.spy(() =>
					BluebirdPromise.resolve(new fm.config.Response('', { status: 203 }))
				);
				fm.mock(/.*/, {
					then: stub
				});
				const res = await fm.fetchHandler('http://thing.place');
				expect(stub.calledOnce).to.be.true;
				expect(res.status).to.equal(203);
				fm.config.Promise = NativePromise;
			});

			it('can use custom promises but return native promise', async () => {
				fm.mock('http://example.com/', BluebirdPromise.resolve(200));

				const responsePromise = fm.fetchHandler('http://example.com');
				expect(responsePromise).to.be.instanceof(NativePromise);
				const res = await responsePromise;
				expect(res.status).to.equal(200);
			});
		});

		describe('fetch classes', () => {
			const getHeadersSpy = () => {
				const spy = function(config) {
					spy.callCount += 1;
					if (config) {
						return new fetchMock.config.Headers(config);
					} else {
						return new fetchMock.config.Headers();
					}
				};
				spy.prototype = fetchMock.config.Headers;
				spy.callCount = 0;
				return spy;
			};

			const getResponseSpy = () => {
				const spy = function(body, opts) {
					spy.callCount += 1;
					return new fetchMock.config.Response(body, opts);
				};
				spy.prototype = fetchMock.config.Response;
				spy.callCount = 0;
				return spy;
			};

			let defaultSpies = null;

			beforeEach(() => {
				fm = fetchMock.createInstance();

				defaultSpies = {
					Headers: getHeadersSpy(),
					Response: getResponseSpy()
				};

				fm.config = Object.assign(fm.config, defaultSpies);
			});

			it('should use the configured Headers', async () => {
				const spiedReplacementHeaders = getHeadersSpy();
				fm.config.Headers = spiedReplacementHeaders;

				fm.mock('http://example.com/', {
					status: 200,
					headers: { id: 1 }
				});

				await fetch('http://example.com/', {
					headers: { id: 1 }
				});
				expect(spiedReplacementHeaders.callCount).to.equal(1);
				expect(defaultSpies.Headers.callCount).to.equal(0);
			});

			it('should use the configured Request', () => {
				const ReplacementRequest = function(url) {
					this.url = url;
					this.method = 'GET';
					this.headers = [];
				};

				fm.config.Request = ReplacementRequest;
				fm.mock('http://example.com/', { status: 200 });

				const requestInstance = new ReplacementRequest('http://example.com/');

				// As long as this is successful, it's worked, as we've correctly
				// matched the request against overridden prototype.
				return fetch(requestInstance);
			});

			it('should use the configured Response', async () => {
				const spiedReplacementResponse = sinon.stub().returns({ isFake: true });
				fm.config.Response = spiedReplacementResponse;

				fm.mock('http://example.com/', { status: 200 });

				const res = await fetch('http://example.com/');
				expect(res.isFake).to.be.true;
				expect(spiedReplacementResponse.callCount).to.equal(1);
				expect(defaultSpies.Response.callCount).to.equal(0);
			});
		});
	});
};
