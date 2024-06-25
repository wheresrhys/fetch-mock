import { describe, expect, it } from 'vitest';

import Route from '../../Route.js';

describe('method matching', () => {

	it('match any method by default', async () => {
		const route = new Route({matcher: '*', response:200});

		expect(route.matcher('http://a.com/', { method: 'GET' })).toBe(true);
		expect(route.matcher('http://a.com/', { method: 'POST' })).toBe(true);
	});

	it('configure an exact method to match', async () => {
		const route = new Route({ method: 'POST' , response:200});

		expect(route.matcher('http://a.com/', { method: 'GET' })).toBe(false);
		expect(route.matcher('http://a.com/', { method: 'POST' })).toBe(true);
	});

	it('match implicit GET', async () => {
		const route = new Route({ method: 'GET' , response:200});
		expect(route.matcher('http://a.com/')).toBe(true);
	});

	it('be case insensitive', async () => {
		const upperCaseRoute = new Route({ method: 'POST' , response:200})
		const lowerCaseRoute = new Route({ method: 'post', response: 200 })

		expect(upperCaseRoute.matcher('http://a.com/', { method: 'post' })).toBe(true);
		expect(upperCaseRoute.matcher('http://a.com/', { method: 'POST' })).toBe(true);
		expect(lowerCaseRoute.matcher('http://a.com/', { method: 'post' })).toBe(true);
		expect(lowerCaseRoute.matcher('http://a.com/', { method: 'POST' })).toBe(true);
	});

	it('can be used alongside function matchers', async () => {
		const route = new Route(
			{
				method: 'POST',
				matcher: (url) => /a\.com/.test(url),
			
			response:200},
		);

		expect(route.matcher('http://a.com')).toBe(false);
		expect(route.matcher('http://b.com', { method: 'POST' })).toBe(false);
		expect(route.matcher('http://a.com', { method: 'POST' })).toBe(true);
	});
});
