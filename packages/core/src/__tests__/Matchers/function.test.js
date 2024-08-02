import { describe, expect, it } from 'vitest';
import Route from '../../Route.ts';

describe('function matching', () => {
	it('match using custom function', () => {
		const route = new Route({
			matcherFunction: ({ url, options }) =>
				url.indexOf('logged-in') > -1 &&
				options &&
				options.headers &&
				options.headers.authorized === true,
			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/12345',
				options: {
					headers: { authorized: true },
				},
			}),
		).toBe(false);
		expect(route.matcher({ url: 'http://a.com/logged-in' })).toBe(false);
		expect(
			route.matcher({
				url: 'http://a.com/logged-in',
				options: {
					headers: { authorized: true },
				},
			}),
		).toBe(true);
	});

	it('match using custom function using request body', () => {
		const route = new Route({
			matcherFunction: (req) => {
				return req.options.body === 'a string';
			},
			response: 200,
		});
		expect(route.matcher({ url: 'http://a.com/logged-in', options: {} })).toBe(
			false,
		);
		expect(
			route.matcher({
				url: 'http://a.com/logged-in',
				options: {
					method: 'post',
					body: 'a string',
				},
			}),
		).toBe(true);
	});

	it('match using custom function alongside other matchers', () => {
		const route = new Route({
			url: 'end:profile',
			response: 200,
			matcherFunction: ({ options }) =>
				options && options.headers && options.headers.authorized === true,
		});

		expect(route.matcher({ url: 'http://a.com/profile' })).toBe(false);
		expect(
			route.matcher({
				url: 'http://a.com/not',
				options: {
					headers: { authorized: true },
				},
			}),
		).toBe(false);
		expect(
			route.matcher({
				url: 'http://a.com/profile',
				options: {
					headers: { authorized: true },
				},
			}),
		).toBe(true);
	});
});
