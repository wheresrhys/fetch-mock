import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchMock } = testGlobals;
describe('custom implementations', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	describe('fetch classes', () => {
		const getHeadersSpy = () => {
			const spy = function (config) {
				spy.callCount += 1;
				if (config) {
					return new fetchMock.config.Headers(config);
				}
				return new fetchMock.config.Headers();
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
			expect(spiedReplacementHeaders.callCount).toEqual(1);
			expect(defaultSpies.Headers.callCount).toEqual(0);
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

			expect(() => fetch(new fetchMock.config.Request('http://a.com'))).toThrow(
				'Unrecognised Request object',
			);
		});

		it('should use the configured Response', async () => {
			const obj = { isFake: true };
			// Clone from Response interface is used internally to store copy in call log
			obj.clone = () => obj;
			const spiedReplacementResponse = vi.fn().mockReturnValue(obj);
			fm.config.Response = spiedReplacementResponse;

			fm.mock('*', 'hello');

			const res = await fetch('http://a.com');
			expect(res.isFake).toBe(true);
			expect(spiedReplacementResponse).toHaveBeenCalledTimes(1);
			expect(spiedReplacementResponse).toHaveBeenCalledWith(
				'hello',
				expect.objectContaining({ status: 200 }),
			);
			expect(defaultSpies.Response.callCount).toEqual(0);
		});
	});
});
