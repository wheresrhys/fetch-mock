const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');
const BluebirdPromise = require('bluebird');
const NativePromise = Promise;
const { fetchMock } = testGlobals;
describe('custom implementations', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	describe('Promise', () => {
		it('can be configured to use alternate Promise implementations', async () => {
			fm.config.Promise = BluebirdPromise;
			fm.mock('*', 200);
			const responsePromise = fetch('http://a.com');
			expect(responsePromise).to.be.instanceof(BluebirdPromise);
			// this tests we actually resolve tthe promise ok
			const { status } = await responsePromise;
			expect(status).to.equal(200);
		});

		it('should allow non-native Promises as responses', async () => {
			fm.config.Promise = BluebirdPromise;
			const stub = sinon.spy((fn) =>
				fn(BluebirdPromise.resolve(new fm.config.Response('', { status: 200 })))
			);
			fm.mock('*', {
				then: stub,
			});
			const { status } = await fm.fetchHandler('http://a.com');
			expect(stub.calledOnce).to.be.true;
			expect(status).to.equal(200);
		});

		it('can use custom promises but return native promise', async () => {
			fm.mock('*', BluebirdPromise.resolve(200));

			const responsePromise = fm.fetchHandler('http://a.com');
			expect(responsePromise).to.be.instanceof(NativePromise);
			const { status } = await responsePromise;
			expect(status).to.equal(200);
		});
	});

	describe('fetch classes', () => {
		const getHeadersSpy = () => {
			const spy = function (config) {
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
			const spy = function (body, opts) {
				spy.callCount += 1;
				return new fetchMock.config.Response(body, opts);
			};
			spy.prototype = fetchMock.config.Response;
			spy.callCount = 0;
			return spy;
		};

		let defaultSpies;

		beforeEach(() => {
			fm = fetchMock.createInstance();

			defaultSpies = {
				Headers: getHeadersSpy(),
				Response: getResponseSpy(),
			};
			fm.config = Object.assign(fm.config, defaultSpies);
		});

		it('should use the configured Headers when generating a response', async () => {
			const spiedReplacementHeaders = getHeadersSpy();
			fm.config.Headers = spiedReplacementHeaders;
			fm.mock('*', {
				status: 200,
				headers: { id: 1 },
			});

			await fetch('http://a.com');
			expect(spiedReplacementHeaders.callCount).to.equal(1);
			expect(defaultSpies.Headers.callCount).to.equal(0);
		});

		it('should use the configured Request when matching', async () => {
			const ReplacementRequest = function (url) {
				this.url = url;
				this.method = 'GET';
				this.headers = [];
			};

			fm.config.Request = ReplacementRequest;
			fm.mock('*', 200);

			// As long as this is successful, it's worked, as we've correctly
			// matched the request against overridden prototype.
			await fetch(new ReplacementRequest('http://a.com'));

			expect(() =>
				fetch(new fetchMock.config.Request('http://a.com'))
			).to.throw('Unrecognised Request object');
		});

		it('should use the configured Response', async () => {
			const obj = { isFake: true };
			/** Clone from Response interface is used internally to store copy in call log */
			obj.clone = () => obj;
			const spiedReplacementResponse = sinon.stub().returns(obj);
			fm.config.Response = spiedReplacementResponse;

			fm.mock('*', 'hello');

			const res = await fetch('http://a.com');
			expect(res.isFake).to.be.true;
			expect(spiedReplacementResponse.callCount).to.equal(1);
			const lastCall = spiedReplacementResponse.lastCall.args;
			expect(lastCall[0]).to.equal('hello');
			expect(lastCall[1].status).to.equal(200);
			expect(defaultSpies.Response.callCount).to.equal(0);
		});
	});
});
