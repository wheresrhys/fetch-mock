import { describe, expect, it } from 'vitest';
import fetchMock from '../FetchMock';

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

	it('not match on async body property without passing `usesBody: true`', () => {
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
		).catch();
		expect(() =>
			fm.fetchHandler(
				new fm.config.Request('http://a.com', {
					method: 'POST',
					body: JSON.stringify({ a: true }),
				}),
			),
		).rejects;
	});
});
