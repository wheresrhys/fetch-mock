import { describe, expect, it } from 'vitest';
import Route from '../../Route.js';

// TODO should this whole thing be integration tests on router
// as it's mainly about the shape of optiosn passed into to addRoute
describe('matcher object', () => {
	it('use matcher object with matcher property', () => {
		const route = new Route({ url: 'http://a.com', response: 200 });
		expect(route.matcher('http://a.com')).toBe(true);
	});

	it('use matcher object with url property', () => {
		const route = new Route({ url: 'http://a.com', response: 200 });
		expect(route.matcher('http://a.com')).toBe(true);
	});

	it('can use function and url simultaneously', () => {
		const route = new Route({
			url: 'end:path',
			func: (url, opts) =>
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
	it.skip('if no url provided, match any url', () => {
		const route = new Route({ response: 200 });
		expect(route.matcher('http://a.com')).toBe(true);
	});

	//TODO be stronger on discouraging this
	it.skip('deprecated message on using func (prefer matcher)', () => {
		new Route({
			url: 'end:profile',
			func: (url, opts) =>
				opts && opts.headers && opts.headers.authorized === true,
			response: 200,
		});
	});

	it('can match Headers', () => {
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

	it('can match query string', () => {
		const route = new Route({
			url: 'http://a.com',
			query: { a: 'b' },
			response: 200,
		});

		expect(route.matcher('http://a.com')).toBe(false);
		expect(route.matcher('http://a.com?a=b')).toBe(true);
	});

	it('can match path parameter', () => {
		const route = new Route({
			url: 'express:/type/:var',
			params: { var: 'b' },
			response: 200,
		});
		expect(route.matcher('/')).toBe(false);
		expect(route.matcher('/type/a')).toBe(false);
		expect(route.matcher('/type/b')).toBe(true);
	});

	it('can match method', () => {
		const route = new Route({ method: 'POST', response: 200 });
		expect(route.matcher('http://a.com', { method: 'GET' })).toBe(false);
		expect(route.matcher('http://a.com', { method: 'POST' })).toBe(true);
	});

	it('can match body', () => {
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

	it('support setting matchPartialBody on matcher parameter', () => {
		const route = new Route({
			body: { a: 1 },
			matchPartialBody: true,
			response: 200,
		});
		expect(
			route.matcher('http://a.com', {
				method: 'POST',
				body: JSON.stringify({ a: 1, b: 2 }),
			}),
		).toBe(true);
	});
});
