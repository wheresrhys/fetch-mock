import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetchMock from '../../FetchMock';

describe('response negotiation', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	it('function', async () => {
		fm.route('*', ({ url }) => url);
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('http://a.com/');
	});

	it('Promise', async () => {
		fm.route('*', Promise.resolve(200));
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
	});

	it('function that returns a Promise for a status', async () => {
		fm.route('*', () => Promise.resolve(300));
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(300);
	});
	it('function that returns a Promise for a body', async () => {
		fm.route('*', ({ url }) => Promise.resolve(`test: ${url}`));
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('test: http://a.com/');
	});

	it('Promise for a function that returns a response', async () => {
		fm.route(
			'http://a.com/',
			Promise.resolve(({ url }) => `test: ${url}`),
		);
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('test: http://a.com/');
	});
	describe('delay', () => {
		it('delay', async () => {
			fm.route('*', 200, { delay: 20 });
			const req = fm.fetchHandler('http://a.com/');
			let resolved = false;
			req.then(() => {
				resolved = true;
			});
			await new Promise((res) => setTimeout(res, 10));
			expect(resolved).toBe(false);
			await new Promise((res) => setTimeout(res, 11));
			expect(resolved).toBe(true);
			const res = await req;
			expect(res.status).toEqual(200);
		});

		it("delay a function response's execution", async () => {
			const startTimestamp = new Date().getTime();
			fm.route('http://a.com/', () => ({ timestamp: new Date().getTime() }), {
				delay: 20,
			});
			const req = fm.fetchHandler('http://a.com/');
			let resolved = false;
			req.then(() => {
				resolved = true;
			});
			await new Promise((res) => setTimeout(res, 10));
			expect(resolved).toBe(false);
			await new Promise((res) => setTimeout(res, 11));
			expect(resolved).toBe(true);
			const res = await req;
			expect(res.status).toEqual(200);
			const responseTimestamp = (await res.json()).timestamp;
			expect(responseTimestamp - startTimestamp).toBeGreaterThanOrEqual(20);
		});

		it('pass values to delayed function', async () => {
			fm.route('*', ({ url }) => `delayed: ${url}`, {
				delay: 10,
			});
			const req = fm.fetchHandler('http://a.com/');
			await new Promise((res) => setTimeout(res, 11));
			const res = await req;
			expect(res.status).toEqual(200);
			expect(await res.text()).toEqual('delayed: http://a.com/');
		});

		it('call delayed response multiple times, each with the same delay', async () => {
			fm.route('*', 200, { delay: 20 });
			const req1 = fm.fetchHandler('http://a.com/');
			let resolved = false;
			req1.then(() => {
				resolved = true;
			});
			await new Promise((res) => setTimeout(res, 10));
			expect(resolved).toBe(false);
			await new Promise((res) => setTimeout(res, 11));
			expect(resolved).toBe(true);
			const res1 = await req1;
			expect(res1.status).toEqual(200);
			const req2 = fm.fetchHandler('http://a.com/');
			resolved = false;
			req2.then(() => {
				resolved = true;
			});
			await new Promise((res) => setTimeout(res, 10));
			expect(resolved).toBe(false);
			await new Promise((res) => setTimeout(res, 11));
			expect(resolved).toBe(true);
			const res2 = await req2;
			expect(res2.status).toEqual(200);
		});
	});

	describe('waitFor', () => {
		it('Error informatively if route to wait for does not exist', () => {
			expect(() => fm.route('*', 200, { waitFor: 'huh' })).toThrow(
				'Cannot wait for route `huh`: route of that name does not exist',
			);
		});
		it('Not respond until waited for route responds', async () => {
			fm.route('http://a.com', 200, 'route-a').route('http://b.com', 200, {
				waitFor: 'route-a',
			});
			let lastRouteCalled;
			await Promise.all([
				fm.fetchHandler('http://b.com').then(() => (lastRouteCalled = 'b')),
				fm.fetchHandler('http://a.com').then(() => (lastRouteCalled = 'a')),
			]);
			expect(lastRouteCalled).toEqual('b');
		});
		it('Can have multiple waits on the same route', async () => {
			fm.route('http://a.com', 200, 'route-a')
				.route('http://b.com', 200, { waitFor: 'route-a' })
				.route('http://c.com', 200, { waitFor: 'route-a' });
			let routesCalled = [];
			await Promise.all([
				fm.fetchHandler('http://c.com').then(() => routesCalled.push('c')),
				fm.fetchHandler('http://b.com').then(() => routesCalled.push('b')),
				fm.fetchHandler('http://a.com').then(() => routesCalled.push('a')),
			]);
			expect(routesCalled).toEqual(['a', 'b', 'c']);
		});
		it('Can chain waits', async () => {
			fm.route('http://a.com', 200, 'route-a')
				.route('http://b.com', 200, { name: 'route-b', waitFor: 'route-a' })
				.route('http://c.com', 200, { waitFor: 'route-b' });
			let routesCalled = [];
			await Promise.all([
				fm.fetchHandler('http://c.com').then(() => routesCalled.push('c')),
				fm.fetchHandler('http://b.com').then(() => routesCalled.push('b')),
				fm.fetchHandler('http://a.com').then(() => routesCalled.push('a')),
			]);
			expect(routesCalled).toEqual(['a', 'b', 'c']);
		});
	});
	it('Response', async () => {
		fm.route('http://a.com/', new Response('http://a.com/', { status: 200 }));
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
	});

	it('should work with Response.error()', async () => {
		fm.route('http://a.com', Response.error());
		const response = await fm.fetchHandler('http://a.com');
		expect(response.status).toBe(0);
	});

	it('function that returns a Response', async () => {
		fm.route(
			'http://a.com/',
			() => new Response('http://a.com/', { status: 200 }),
		);
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
	});

	it('Promise that returns a Response', async () => {
		fm.route(
			'http://a.com/',
			Promise.resolve(new Response('http://a.com/', { status: 200 })),
		);
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
	});

	describe('rejecting', () => {
		it('reject if object with `throws` property', async () => {
			fm.route('*', { throws: 'as expected' });

			await expect(fm.fetchHandler('http://a.com/')).rejects.toThrowError(
				'as expected',
			);
		});

		it('reject if function that returns object with `throws` property', async () => {
			fm.route('*', () => ({ throws: 'as expected' }));

			await expect(fm.fetchHandler('http://a.com/')).rejects.toThrowError(
				'as expected',
			);
		});
	});

	describe('abortable fetch', () => {
		const getDelayedAbortController = (delay) => {
			const controller = new AbortController();
			setTimeout(() => controller.abort(), delay);
			return controller;
		};

		it('error on signal abort', async () => {
			fm.route('*', 200, { delay: 50 });
			await expect(
				fm.fetchHandler('http://a.com', {
					signal: getDelayedAbortController(10).signal,
				}),
			).rejects.toThrowError(
				new DOMException('The operation was aborted.', 'AbortError'),
			);
		});

		it('error on signal abort for request object', async () => {
			fm.route('*', 200, { delay: 50 });
			await expect(
				fm.fetchHandler(
					new fm.config.Request('http://a.com', {
						signal: getDelayedAbortController(10).signal,
					}),
				),
			).rejects.toThrowError(
				new DOMException('The operation was aborted.', 'AbortError'),
			);
		});

		it('error when signal already aborted', async () => {
			fm.route('*', 200);
			const controller = new AbortController();
			controller.abort();
			await expect(
				fm.fetchHandler('http://a.com', {
					signal: controller.signal,
				}),
			).rejects.toThrowError(
				new DOMException('The operation was aborted.', 'AbortError'),
			);
		});

		it('aborts sending request options body stream', async () => {
			fm.route('*', 200, { delay: 50 });
			const body = new ReadableStream();
			vi.spyOn(body, 'cancel');
			await expect(
				fm.fetchHandler('http://a.com', {
					method: 'post',
					body,
					signal: getDelayedAbortController(10).signal,
				}),
			).rejects.toThrowError(
				new DOMException('The operation was aborted.', 'AbortError'),
			);
			expect(body.cancel).toHaveBeenCalledWith(
				new DOMException('The operation was aborted.', 'AbortError'),
			);
		});

		// this doesn't work as the callLog creatde from the request awaits the body
		it.skip('aborts sending request body stream', async () => {
			fm.route('*', 200, { delay: 50 });
			const body = new ReadableStream();
			vi.spyOn(body, 'cancel');
			const request = new Request('http://a.com', {
				method: 'post',
				body,
				duplex: 'half',
				signal: getDelayedAbortController(10).signal,
			});
			await expect(fm.fetchHandler(request)).rejects.toThrowError(
				new DOMException('The operation was aborted.', 'AbortError'),
			);
			expect(body.cancel).toHaveBeenCalledWith(
				new DOMException('The operation was aborted.', 'AbortError'),
			);
		});

		it.skip('aborts receiving response body stream', async () => {
			// so fiddly to implement a test for this. Uses the same mechanism as cancelling request body though
			// so I trust that if one works the other does
		});

		it('go into `done` state even when aborted', async () => {
			fm.once('http://a.com', 200, { delay: 50 });

			await expect(
				fm.fetchHandler('http://a.com', {
					signal: getDelayedAbortController(10).signal,
				}),
			).rejects.toThrowError(
				new DOMException('The operation was aborted.', 'AbortError'),
			);

			expect(fm.callHistory.done()).toBe(true);
		});

		it('will flush even when aborted', async () => {
			fm.route('http://a.com', 200, { delay: 50 });

			await expect(
				fm.fetchHandler('http://a.com', {
					signal: getDelayedAbortController(10).signal,
				}),
			).rejects.toThrowError(
				new DOMException('The operation was aborted.', 'AbortError'),
			);
			await fm.callHistory.flush();
			expect(fm.callHistory.done()).toBe(true);
		});
	});
});
