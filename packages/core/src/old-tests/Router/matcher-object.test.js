import { beforeEach, describe, expect, it } from 'vitest';

const { fetchMock } = testGlobals;
describe('matcher object', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});

	it('use matcher object with matcher property', async () => {
		fm.route({ matcher: 'http://a.com' }, 200).catch();
		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('use matcher object with url property', async () => {
		fm.route({ url: 'http://a.com' }, 200).catch();
		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('can use matcher and url simultaneously', async () => {
		fm.route(
			{
				url: 'end:path',
				matcher: (url, opts) =>
					opts && opts.headers && opts.headers.authorized === true,
			},
			200,
		).catch();

		await fm.fetchHandler('http://a.com/path');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com', {
			headers: { authorized: true },
		});
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com/path', {
			headers: { authorized: true },
		});
		expect(fm.calls(true).length).toEqual(1);
	});

	it('if no url provided, match any url', async () => {
		fm.route({}, 200).catch();

		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).toEqual(1);
	});

	it.skip('deprecated message on using functionMatcher (prefer matcher)', () => {
		fm.route(
			{
				url: 'end:profile',
				functionMatcher: (url, opts) =>
					opts && opts.headers && opts.headers.authorized === true,
			},
			200,
		).catch();
	});

	it('can match Headers', async () => {
		fm.route({ url: 'http://a.com', headers: { a: 'b' } }, 200).catch();

		await fm.fetchHandler('http://a.com', {
			headers: { a: 'c' },
		});
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com', {
			headers: { a: 'b' },
		});
		expect(fm.calls(true).length).toEqual(1);
	});

	it('can match query string', async () => {
		fm.route({ url: 'http://a.com', query: { a: 'b' } }, 200).catch();

		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com?a=b');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('can match path parameter', async () => {
		fm.route({ url: 'express:/type/:var', params: { var: 'b' } }, 200).catch();
		await fm.fetchHandler('/');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/type/a');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/type/b');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('can match method', async () => {
		fm.route({ method: 'POST' }, 200).catch();

		await fm.fetchHandler('http://a.com', { method: 'GET' });
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com', { method: 'POST' });
		expect(fm.calls(true).length).toEqual(1);
	});

	it('can match body', async () => {
		fm.route({ body: { foo: 'bar' } }, 200).catch();

		await fm.fetchHandler('http://a.com', {
			method: 'POST',
		});
		expect(fm.calls(true).length).toEqual(0);

		await fm.fetchHandler('http://a.com', {
			method: 'POST',
			body: JSON.stringify({ foo: 'bar' }),
			headers: { 'Content-Type': 'application/json' },
		});
		expect(fm.calls(true).length).toEqual(1);
	});

	it('support setting overwrite routes on matcher parameter', async () => {
		expect(() =>
			fm
				.route('http://a.com', 200)
				.route({ url: 'http://a.com', overwriteRoutes: true }, 300),
		).not.toThrow();

		const res = await fm.fetchHandler('http://a.com');
		expect(res.status).toEqual(300);
	});

	it('support setting matchPartialBody on matcher parameter', async () => {
		fm.route({ body: { a: 1 }, matchPartialBody: true }, 200).catch(404);
		const res = await fm.fetchHandler('http://a.com', {
			method: 'POST',
			body: JSON.stringify({ a: 1, b: 2 }),
		});
		expect(res.status).toEqual(200);
	});
});
