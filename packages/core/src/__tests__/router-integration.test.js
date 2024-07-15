import { describe, expect, it } from 'vitest';
import fetchMock from '../FetchMock';
describe('Router', () => {
	describe('router integration', () => {
		it('matchurls  when called with Request', async () => {
			const fm = fetchMock.createInstance();
			fm.post('http://a.com/', 200).catch();

			await expect(
				fm.fetchHandler(
					new fm.config.Request('http://a.com/', { method: 'POST' }),
				),
			).resolves.not.toThrow();
		});

		it('match using custom function with Request', async () => {
			const fm = fetchMock.createInstance();
			fm.route((url, options) => {
				return url.indexOf('logged-in') > -1 && options.headers.authorized;
			}, 200);

			await expect(
				fm.fetchHandler(
					new Request('http://a.com/logged-in', {
						headers: { authorized: 'true' },
					}),
				),
			).resolves.not.toThrow();
		});

		it('match using custom function with Request with unusual options', async () => {
			// as node-fetch does not try to emulate all the WHATWG standards, we can't check for the
			// same properties in the browser and nodejs
			const propertyToCheck = new Request('http://example.com').cache
				? 'credentials'
				: 'compress';
			const valueToSet = propertyToCheck === 'credentials' ? 'include' : false;

			const fm = fetchMock.createInstance();
			fm.route(
				(url, options, request) => request[propertyToCheck] === valueToSet,
				200,
			);

			await expect(
				fm.fetchHandler(new Request('http://a.com/logged-in')),
			).rejects.toThrow();
			expect(
				fm.fetchHandler(
					new Request('http://a.com/logged-in', {
						[propertyToCheck]: valueToSet,
					}),
				),
			).resolves.not.toThrow();
		});
	});
	describe('user defined matchers', () => {
		it('match on sync property', async () => {
			const fm = fetchMock.createInstance();
			fm.defineMatcher({
				name: 'syncMatcher',
				matcher: (route) => (url) => url.indexOf(route.syncMatcher) > -1,
			});
			fm.route(
				{
					syncMatcher: 'a',
				},
				200,
			).catch(404);
			const miss = await fm.fetchHandler('http://b.com');
			expect(miss.status).toEqual(404);
			const hit = await fm.fetchHandler('http://a.com');
			expect(hit.status).toEqual(200);
		});

		it('match on async body property', async () => {
			const fm = fetchMock.createInstance();
			fm.defineMatcher({
				name: 'bodyMatcher',
				matcher: (route) => (url, options) =>
					JSON.parse(options.body)[route.bodyMatcher] === true,
				usesBody: true,
			});
			fm.route(
				{
					bodyMatcher: 'a',
				},
				200,
			).catch(404);
			const miss = await fm.fetchHandler(
				new fm.config.Request('http://a.com', {
					method: 'POST',
					body: JSON.stringify({ b: true }),
				}),
			);
			expect(miss.status).toEqual(404);
			const hit1 = await fm.fetchHandler(
				new fm.config.Request('http://a.com', {
					method: 'POST',
					body: JSON.stringify({ a: true }),
				}),
			);
			expect(hit1.status).toEqual(200);
			const hit2 = await fm.fetchHandler('http://a.com', {
				method: 'POST',
				body: JSON.stringify({ a: true }),
			});
			expect(hit2.status).toEqual(200);
		});

		// TODO This test hangs
		// Need to decide what the actual behaviour should be when trying to access body
		// prematurely - should it throw early somehow when options.body is accessed?
		it.skip('not match on async body property without passing `usesBody: true`', async () => {
			const fm = fetchMock.createInstance();
			fm.defineMatcher({
				name: 'asyncBodyMatcher',
				matcher: (route) => (url, options) =>
					JSON.parse(options.body)[route.asyncBodyMatcher] === true,
			});
			fm.route(
				{
					asyncBodyMatcher: 'a',
				},
				200,
			);
			await expect(
				fm.fetchHandler(
					new fm.config.Request('http://a.com', {
						method: 'POST',
						body: JSON.stringify({ a: true }),
					}),
				),
			).rejects.toThrow();
		});
	});
});
