import { describe, expect, it } from 'vitest';

import Route from '../../Route.js';

describe('method matching', () => {
	it('match any method by default', () => {
		const route = new Route({ url: '*', response: 200 });

		expect(
			route.matcher({ url: 'http://a.com/', options: { method: 'GET' } }),
		).toBe(true);
		expect(
			route.matcher({ url: 'http://a.com/', options: { method: 'POST' } }),
		).toBe(true);
	});

	it('configure an exact method to match', () => {
		const route = new Route({ method: 'POST', response: 200 });

		expect(
			route.matcher({ url: 'http://a.com/', options: { method: 'GET' } }),
		).toBe(false);
		expect(
			route.matcher({ url: 'http://a.com/', options: { method: 'POST' } }),
		).toBe(true);
	});

	it('match implicit GET', () => {
		const route = new Route({ method: 'GET', response: 200 });
		expect(route.matcher({ url: 'http://a.com/' })).toBe(true);
	});

	it('be case insensitive', () => {
		const upperCaseRoute = new Route({ method: 'POST', response: 200 });
		const lowerCaseRoute = new Route({ method: 'post', response: 200 });

		expect(
			upperCaseRoute.matcher({
				url: 'http://a.com/',
				options: { method: 'post' },
			}),
		).toBe(true);
		expect(
			upperCaseRoute.matcher({
				url: 'http://a.com/',
				options: { method: 'POST' },
			}),
		).toBe(true);
		expect(
			lowerCaseRoute.matcher({
				url: 'http://a.com/',
				options: { method: 'post' },
			}),
		).toBe(true);
		expect(
			lowerCaseRoute.matcher({
				url: 'http://a.com/',
				options: { method: 'POST' },
			}),
		).toBe(true);
	});

	it('can be used alongside function matchers', () => {
		const route = new Route({
			method: 'POST',
			matcherFunction: ({ url }) => /a\.com/.test(url),

			response: 200,
		});

		expect(route.matcher({ url: 'http://a.com' })).toBe(false);
		expect(
			route.matcher({ url: 'http://b.com', options: { method: 'POST' } }),
		).toBe(false);
		expect(
			route.matcher({ url: 'http://a.com', options: { method: 'POST' } }),
		).toBe(true);
	});
});
