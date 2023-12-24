import {
	afterEach, describe, expect, it, beforeAll,
} from 'vitest';

const { fetchMock } = testGlobals;

describe('response negotiation', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('function', async () => {
		fm.mock('*', (url) => url);
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('http://a.com/');
	});

	it('Promise', async () => {
		fm.mock('*', Promise.resolve(200));
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
	});

	it('function that returns a Promise', async () => {
		fm.mock('*', (url) => Promise.resolve(`test: ${url}`));
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('test: http://a.com/');
	});

	it('Promise for a function that returns a response', async () => {
		fm.mock(
			'http://a.com/',
			Promise.resolve((url) => `test: ${url}`),
		);
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('test: http://a.com/');
	});

	it('delay', async () => {
		fm.mock('*', 200, { delay: 20 });
		const req = fm.fetchHandler('http://a.com/');
		let resolved = false;
		req.then(() => {resolved = true});
		await new Promise((res) => setTimeout(res, 10));
		expect(resolved).toBe(false);
		await new Promise((res) => setTimeout(res, 11));
		expect(resolved).toBe(true);
		const res = await req;
		expect(res.status).toEqual(200);
	});

	it("delay a function response's execution", async () => {
		const startTimestamp = new Date().getTime();
		fm.mock('http://a.com/', () => ({ timestamp: new Date().getTime() }), {
			delay: 20,
		});
		const req = fm.fetchHandler('http://a.com/');
		let resolved = false;
		req.then(() => {resolved = true});
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
		fm.mock('*', (url) => `delayed: ${url}`, {
			delay: 10,
		});
		const req = fm.fetchHandler('http://a.com/');
		await new Promise((res) => setTimeout(res, 11));
		const res = await req;
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('delayed: http://a.com/');
	});

	it('call delayed response multiple times, each with the same delay', async () => {
		fm.mock('*', 200, { delay: 20 });
		const req1 = fm.fetchHandler('http://a.com/');
		let resolved = false;
		req1.then(() => {resolved = true});
		await new Promise((res) => setTimeout(res, 10));
		expect(resolved).toBe(false);
		await new Promise((res) => setTimeout(res, 11));
		expect(resolved).toBe(true);
		const res1 = await req1;
		expect(res1.status).toEqual(200);
		const req2 = fm.fetchHandler('http://a.com/');
		resolved = false;
		req2.then(() => {resolved = true});
		await new Promise((res) => setTimeout(res, 10));
		expect(resolved).toBe(false);
		await new Promise((res) => setTimeout(res, 11));
		expect(resolved).toBe(true);
		const res2 = await req2;
		expect(res2.status).toEqual(200);
	});

	it('Response', async () => {
		fm.mock(
			'http://a.com/',
			new fm.config.Response('http://a.com/', { status: 200 }),
		);
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
	});

	it('function that returns a Response', async () => {
		fm.mock(
			'http://a.com/',
			() => new fm.config.Response('http://a.com/', { status: 200 }),
		);
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
	});

	it('Promise that returns a Response', async () => {
		fm.mock(
			'http://a.com/',
			Promise.resolve(new fm.config.Response('http://a.com/', { status: 200 })),
		);
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(200);
	});

	describe('rejecting', () => {
		it('reject if object with `throws` property',  () => {
			fm.mock('*', { throws: 'as expected' });

			return fm
				.fetchHandler('http://a.com/')
				.then(() => {
					throw 'not as expected';
				})
				.catch((err) => {
					expect(err).toEqual('as expected');
				});
		});

		it('reject if function that returns object with `throws` property',  () => {
			fm.mock('*', () => ({ throws: 'as expected' }));

			return fm
				.fetchHandler('http://a.com/')
				.then(() => {
					throw 'not as expected';
				})
				.catch((err) => {
					expect(err).toEqual('as expected');
				});
		});
	});
});
