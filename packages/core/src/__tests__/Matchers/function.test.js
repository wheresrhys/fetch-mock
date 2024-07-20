import { describe, expect, it } from 'vitest';
import Route from '../../Route.js';

describe('function matching', () => {
	it('match using custom function', () => {
		const route = new Route({
			matcher: (url, opts) =>
				url.indexOf('logged-in') > -1 &&
				opts &&
				opts.headers &&
				opts.headers.authorized === true,
			response: 200,
		});

		expect(
			route.matcher('http://a.com/12345', {
				headers: { authorized: true },
			}),
		).toBe(false);
		expect(route.matcher('http://a.com/logged-in')).toBe(false);
		expect(
			route.matcher('http://a.com/logged-in', {
				headers: { authorized: true },
			}),
		).toBe(true);
	});

	it('match using custom function using request body', () => {
		const route = new Route({
			matcher: (url, opts) => opts.body === 'a string',
			response: 200,
		});
		expect(route.matcher('http://a.com/logged-in')).toBe(false);
		expect(
			route.matcher('http://a.com/logged-in', {
				method: 'post',
				body: 'a string',
			}),
		).toBe(true);
	});

	it('match using custom function alongside other matchers', () => {
		const route = new Route({
			matcher: 'end:profile',
			response: 200,
			func: (url, opts) =>
				opts && opts.headers && opts.headers.authorized === true,
		});

		expect(route.matcher('http://a.com/profile')).toBe(false);
		expect(
			route.matcher('http://a.com/not', {
				headers: { authorized: true },
			}),
		).toBe(false);
		expect(
			route.matcher('http://a.com/profile', {
				headers: { authorized: true },
			}),
		).toBe(true);
	});
});
