import { describe, expect, it } from 'vitest';
import Route from '../../Route.js';

describe('header matching', () => {
	it('not match when headers not present', () => {
		const route = new Route({
			headers: { a: 'b' },
			response: 200,
		});

		expect(route.matcher({ url: 'http://a.com/', options: {} })).toBe(false);
	});

	it("not match when headers don't match", () => {
		const route = new Route({
			headers: { a: 'b' },

			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: { a: 'c' },
				},
			}),
		).toBe(false);
	});

	it('match simple headers', () => {
		const route = new Route({
			headers: { a: 'b' },

			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: { a: 'b' },
				},
			}),
		).toBe(true);
	});

	it('match missing headers', () => {
		const route = new Route({
			missingHeaders: ['a'],
			response: 200,
		});
		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: { b: 'c' },
				},
			}),
		).toBe(true);
	});

	it('not match present missing header', () => {
		const route = new Route({
			missingHeaders: ['a'],
			response: 200,
		});
		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: { a: 'b' },
				},
			}),
		).toBe(false);
	});

	it('be case insensitive', () => {
		const route = new Route({
			headers: { a: 'b' },

			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: { A: 'b' },
				},
			}),
		).toBe(true);
	});
	it('match multivalue headers', () => {
		const route = new Route({
			headers: { a: ['b', 'c'] },

			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: { a: ['b', 'c'] },
				},
			}),
		).toBe(true);
	});

	it('not match partially satisfied multivalue headers', () => {
		const route = new Route({
			headers: { a: ['b', 'c', 'd'] },

			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: { a: ['b', 'c'] },
				},
			}),
		).toBe(false);
	});

	it('match multiple headers', () => {
		const route = new Route({
			headers: { a: 'b', c: 'd' },

			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: { a: 'b', c: 'd' },
				},
			}),
		).toBe(true);
	});

	it('not match unsatisfied multiple headers', () => {
		const route = new Route({
			headers: { a: 'b', c: 'd' },

			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: { a: 'b' },
				},
			}),
		).toBe(false);
	});

	it('match Headers instance', () => {
		const route = new Route({
			headers: { a: 'b' },

			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					headers: new Headers({ a: 'b' }),
				},
			}),
		).toBe(true);
	});

	it('can be used alongside function matchers', () => {
		const route = new Route({
			matcher: (url) => /person/.test(url),
			response: 200,
			headers: { a: 'b' },
		});

		expect(
			route.matcher({ url: 'http://domain.com/person', options: {} }),
		).toBe(false);
		expect(
			route.matcher({
				url: 'http://domain.com/person',
				options: {
					headers: { a: 'b' },
				},
			}),
		).toBe(true);
	});

	it('can match against a Headers instance', () => {
		const route = new Route({
			headers: { a: 'b' },
			response: 200,
		});
		const headers = new Headers();

		headers.append('a', 'b');

		expect(route.matcher({ url: 'http://a.com/', options: { headers } })).toBe(
			true,
		);
	});

	it('can match against an array of arrays', () => {
		const route = new Route({
			headers: { a: 'b' },
			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: { headers: [['a', 'b']] },
			}),
		).toBe(true);
	});
});
