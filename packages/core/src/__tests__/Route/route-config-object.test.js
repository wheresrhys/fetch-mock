import { beforeEach, describe, expect, it } from 'vitest';
import Route from '../../Route.js';

describe('matcher object', () => {
	it('use matcher object with matcher property', async () => {
		const route = new Route({ matcher: 'http://a.com', response: 200 });
		expect(route.matcher('http://a.com')).toBe(true);
	});

	it('use matcher object with url property', async () => {
		const route = new Route({ url: 'http://a.com', response: 200 });
		expect(route.matcher('http://a.com')).toBe(true);
	});

	it('can use matcher and url simultaneously', async () => {
		const route = new Route({
			url: 'end:path',
			matcher: (url, opts) =>
				opts && opts.headers && opts.headers.authorized === true,
			response: 200,
		});

		expect(route.matcher('http://a.com/path')).toBe(false);
		expect(
			route.matcher('http://a.com', {
				headers: { authorized: true },
			}),
		).toBe(false);
		expect(
			route.matcher('http://a.com/path', {
				headers: { authorized: true },
			}),
		).toBe(true);
	});

	// TODO this shoudl probably be an error
	it.skip('if no url provided, match any url', async () => {
		const route = new Route({ response: 200 });
		expect(route.matcher('http://a.com')).toBe(true);
	});

	//TODO be strionger on discouraging this
	it.skip('deprecated message on using functionMatcher (prefer matcher)', () => {
		const route = new Route({
			url: 'end:profile',
			functionMatcher: (url, opts) =>
				opts && opts.headers && opts.headers.authorized === true,
			response: 200,
		});
	});

	it('can match Headers', async () => {
		const route = new Route({
			url: 'http://a.com',
			headers: { a: 'b' },
			response: 200,
		});

		expect(
			route.matcher('http://a.com', {
				headers: { a: 'c' },
			}),
		).toBe(false);
		expect(
			route.matcher('http://a.com', {
				headers: { a: 'b' },
			}),
		).toBe(true);
	});

	it('can match query string', async () => {
		const route = new Route({
			url: 'http://a.com',
			query: { a: 'b' },
			response: 200,
		});

		expect(route.matcher('http://a.com')).toBe(false);
		expect(route.matcher('http://a.com?a=b')).toBe(true);
	});

	it('can match path parameter', async () => {
		const route = new Route({
			url: 'express:/type/:var',
			params: { var: 'b' },
			response: 200,
		});
		expect(route.matcher('/')).toBe(false);
		expect(route.matcher('/type/a')).toBe(false);
		expect(route.matcher('/type/b')).toBe(true);
	});

	it('can match method', async () => {
		const route = new Route({ method: 'POST', response: 200 });
		expect(route.matcher('http://a.com', { method: 'GET' })).toBe(false);
		expect(route.matcher('http://a.com', { method: 'POST' })).toBe(true);
	});

	it('can match body', async () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher('http://a.com', {
				method: 'POST',
			}),
		).toBe(false);
		expect(
			route.matcher('http://a.com', {
				method: 'POST',
				body: JSON.stringify({ foo: 'bar' }),
				headers: { 'Content-Type': 'application/json' },
			}),
		).toBe(true);
	});

	// TODO new tests for how multiple routes that match can be addeed
	it.skip('support setting overwrite routes on matcher parameter', async () => {});

	it('support setting matchPartialBody on matcher parameter', async () => {
		const route = new Route({
			body: { a: 1 },
			matchPartialBody: true,
			response: 200,
		});
		const res = expect(
			route.matcher('http://a.com', {
				method: 'POST',
				body: JSON.stringify({ a: 1, b: 2 }),
			}),
		).toBe(true);
	});
});
