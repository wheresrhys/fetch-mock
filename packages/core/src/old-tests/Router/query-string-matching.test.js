import { afterEach, describe, expect, it, beforeAll } from 'vitest';
import { URL } from 'node:url';

const { fetchMock } = testGlobals;
describe('query string matching', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('match a query string', async () => {
		fm.route(
			{
				query: { a: 'b', c: 'd' },
			},
			200,
		).catch();

		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com?a=b&c=d');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match a query string against a URL object', async () => {
		fm.route(
			{
				query: { a: 'b', c: 'd' },
			},
			200,
		).catch();
		const url = new URL('http://a.com/path');
		url.searchParams.append('a', 'b');
		url.searchParams.append('c', 'd');
		await fm.fetchHandler(url);
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match a query string against a relative path', async () => {
		fm.route(
			{
				query: { a: 'b' },
			},
			200,
		).catch();
		const url = '/path?a=b';
		await fm.fetchHandler(url);
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match multiple query strings', async () => {
		fm.route(
			{
				query: { a: 'b', c: 'd' },
			},
			200,
		).catch();

		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com?a=b');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com?a=b&c=d');
		expect(fm.calls(true).length).toEqual(1);
		await fm.fetchHandler('http://a.com?c=d&a=b');
		expect(fm.calls(true).length).toEqual(2);
	});

	it('ignore irrelevant query strings', async () => {
		fm.route(
			{
				query: { a: 'b', c: 'd' },
			},
			200,
		).catch();

		await fm.fetchHandler('http://a.com?a=b&c=d&e=f');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match an empty query string', async () => {
		fm.route(
			{
				query: { a: '' },
			},
			200,
		).catch();

		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com?a=');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('distinguish between query strings that only partially differ', async () => {
		expect(() =>
			fm.route({ query: { a: 'b', c: 'e' } }, 200).route(
				{
					overwriteRoutes: false,
					query: { a: 'b', c: 'd' },
				},
				300,
			),
		).not.toThrow();
		const res = await fm.fetchHandler('http://a.com?a=b&c=d');
		expect(res.status).toEqual(300);
	});

	describe('value coercion', () => {
		it('coerce integers to strings and match', async () => {
			fm.route(
				{
					query: {
						a: 1,
					},
				},
				200,
			).catch();
			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=1');
			expect(fm.calls(true).length).toEqual(1);
		});

		it('coerce floats to strings and match', async () => {
			fm.route(
				{
					query: {
						a: 1.2,
					},
				},
				200,
			).catch();
			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=1.2');
			expect(fm.calls(true).length).toEqual(1);
		});

		it('coerce booleans to strings and match', async () => {
			fm.route(
				{
					query: {
						a: true,
					},
				},
				200,
			)
				.route(
					{
						query: {
							b: false,
						},
						overwriteRoutes: false,
					},
					200,
				)
				.catch();
			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=true');
			expect(fm.calls(true).length).toEqual(1);
			await fm.fetchHandler('http://a.com?b=false');
			expect(fm.calls(true).length).toEqual(2);
		});

		it('coerce undefined to an empty string and match', async () => {
			fm.route(
				{
					query: {
						a: undefined,
					},
				},
				200,
			).catch();
			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=');
			expect(fm.calls(true).length).toEqual(1);
		});

		it('coerce null to an empty string and match', async () => {
			fm.route(
				{
					query: {
						a: null,
					},
				},
				200,
			).catch();
			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=');
			expect(fm.calls(true).length).toEqual(1);
		});

		it('coerce an object to an empty string and match', async () => {
			fm.route(
				{
					query: {
						a: { b: 'c' },
					},
				},
				200,
			).catch();
			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=');
			expect(fm.calls(true).length).toEqual(1);
		});

		it('can match a query string with different value types', async () => {
			const query = {
				t: true,
				f: false,
				u: undefined,
				num: 1,
				arr: ['a', undefined],
			};
			fm.route('http://a.com/', 200, {
				query,
			}).catch();

			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?t=true&f=false&u=&num=1&arr=a&arr=');
			expect(fm.calls(true).length).toEqual(1);
		});
	});

	describe('repeated query strings', () => {
		it('match repeated query strings', async () => {
			fm.route({ url: 'http://a.com/', query: { a: ['b', 'c'] } }, 200).catch();

			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=b');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=b&a=c');
			expect(fm.calls(true).length).toEqual(1);
			await fm.fetchHandler('http://a.com?a=b&a=c&a=d');
			expect(fm.calls(true).length).toEqual(1);
		});

		it('match repeated query strings in any order', async () => {
			fm.route({ url: 'http://a.com/', query: { a: ['b', 'c'] } }, 200).catch();

			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=b&a=c');
			expect(fm.calls(true).length).toEqual(1);
			await fm.fetchHandler('http://a.com?a=c&a=b');
			expect(fm.calls(true).length).toEqual(2);
		});

		it('match a query string array of length 1', async () => {
			fm.route({ url: 'http://a.com/', query: { a: ['b'] } }, 200).catch();

			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=b');
			expect(fm.calls(true).length).toEqual(1);
			await fm.fetchHandler('http://a.com?a=b&a=c');
			expect(fm.calls(true).length).toEqual(1);
		});

		it('match a repeated query string with an empty value', async () => {
			fm.route(
				{ url: 'http://a.com/', query: { a: ['b', undefined] } },
				200,
			).catch();

			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=b');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=b&a=');
			expect(fm.calls(true).length).toEqual(1);
		});
	});

	describe('interoperability', () => {
		it('can be used alongside query strings expressed in the url', async () => {
			fm.route('http://a.com/?c=d', 200, {
				query: { a: 'b' },
			}).catch();

			await fm.fetchHandler('http://a.com?c=d');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?c=d&a=b');
			expect(fm.calls(true).length).toEqual(1);
			await fm.fetchHandler('http://a.com?a=b&c=d');
			expect(fm.calls(true).length).toEqual(1);
		});

		it('can be used alongside function matchers', async () => {
			fm.route((url) => /a\.com/.test(url), 200, {
				query: { a: 'b' },
			}).catch();

			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(0);
			await fm.fetchHandler('http://a.com?a=b');
			expect(fm.calls(true).length).toEqual(1);
		});
	});
});
