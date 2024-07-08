import { describe, expect, it } from 'vitest';
import Route from '../../Route.js';

describe('header matching', () => {
	it('not match when headers not present', () => {
		const route = new Route({
			headers: { a: 'b' },

			response: 200,
		});

		expect(route.matcher('http://a.com/')).toBe(true);
	});

	it("not match when headers don't match", () => {
		const route = new Route({
			headers: { a: 'b' },

			response: 200,
		});

		expect(
			route.matcher('http://a.com/', {
				headers: { a: 'c' },
			}),
		).toBe(false);
	});

	it('match simple headers', () => {
		const route = new Route({
			headers: { a: 'b' },

			response: 200,
		});

		expect(
			route.matcher('http://a.com/', {
				headers: { a: 'b' },
			}),
		).toBe(true);
	});

	it('be case insensitive', () => {
		const route = new Route({
			headers: { a: 'b' },

			response: 200,
		});

		expect(
			route.matcher('http://a.com/', {
				headers: { A: 'b' },
			}),
		).toBe(true);
	});
	// TODO Are these gonna be supported?
	// Should we support it in the fetch-mock matcher API, even though Headers are basically sytrings
	it('match multivalue headers', () => {
		const route = new Route({
			headers: { a: ['b', 'c'] },

			response: 200,
		});

		expect(
			route.matcher('http://a.com/', {
				headers: { a: ['b', 'c'] },
			}),
		).toBe(true);
	});

	it('not match partially satisfied multivalue headers', () => {
		const route = new Route({
			headers: { a: ['b', 'c', 'd'] },

			response: 200,
		});

		expect(
			route.matcher('http://a.com/', {
				headers: { a: ['b', 'c'] },
			}),
		).toBe(false);
	});

	it('match multiple headers', () => {
		const route = new Route({
			headers: { a: 'b', c: 'd' },

			response: 200,
		});

		expect(
			route.matcher('http://a.com/', {
				headers: { a: 'b', c: 'd' },
			}),
		).toBe(true);
	});

	it('not match unsatisfied multiple headers', () => {
		const route = new Route({
			headers: { a: 'b', c: 'd' },

			response: 200,
		});

		expect(
			route.matcher('http://a.com/', {
				headers: { a: 'b' },
			}),
		).toBe(false);
	});

	it('match Headers instance', () => {
		const route = new Route({
			headers: { a: 'b' },

			response: 200,
		});

		expect(
			route.matcher('http://a.com/', {
				headers: new fm.config.Headers({ a: 'b' }),
			}),
		).toBe(true);
	});

	it('can be used alongside function matchers', () => {
		const route = new Route({
			matcher: (url) => /person/.test(url),
			response: 200,
			headers: { a: 'b' },
		});

		expect(route.matcher('http://domain.com/person')).toBe(false);
		expect(
			route.matcher('http://domain.com/person', {
				headers: { a: 'b' },
			}),
		).toBe(true);
	});

	it('match custom Headers instance', async () => {
		const MyHeaders = class {
			constructor(obj) {
				this.obj = obj;
			}

			*[Symbol.iterator]() {
				yield ['a', 'b'];
			}

			has() {
				return true;
			}
		};

		const route = new Route({
			response: 200,
			headers: { a: 'b' },
			config: { Headers: MyHeaders },
		});

		expect(
			route.matcher('http://a.com', {
				headers: new MyHeaders({ a: 'b' }),
			}),
		).toBe(true);
	});
});
