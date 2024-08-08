import { describe, expect, it } from 'vitest';
import Route from '../../Route';

describe('query string matching', () => {
	it('match a query string', () => {
		const route = new Route({
			query: { a: 'b', c: 'd' },
			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com',
				queryParams: new URLSearchParams(''),
			}),
		).toBe(false);
		expect(
			route.matcher({
				url: 'http://a.com',
				queryParams: new URLSearchParams('a=b&c=d'),
			}),
		).toBe(true);
	});

	it('match a query string against a relative path', () => {
		const route = new Route({
			query: { a: 'b' },
			response: 200,
		});
		expect(
			route.matcher({
				url: '/path',
				queryParams: new URLSearchParams('a=b'),
			}),
		).toBe(true);
	});

	it('match multiple query strings', () => {
		const route = new Route({
			query: { a: 'b', c: 'd' },
			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com',
				queryParams: new URLSearchParams(''),
			}),
		).toBe(false);
		expect(
			route.matcher({
				url: 'http://a.com',
				queryParams: new URLSearchParams('a=b'),
			}),
		).toBe(false);
		expect(
			route.matcher({
				url: 'http://a.com',
				queryParams: new URLSearchParams('a=b&c=d'),
			}),
		).toBe(true);
		expect(
			route.matcher({
				url: 'http://a.com',
				queryParams: new URLSearchParams('c=d&a=b'),
			}),
		).toBe(true);
	});

	it('ignore irrelevant query strings', () => {
		const route = new Route({
			query: { a: 'b', c: 'd' },
			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com',
				queryParams: new URLSearchParams('a=b&c=d&e=f'),
			}),
		).toBe(true);
	});
	it('match an empty query string', () => {
		const route = new Route({
			query: { a: '' },
			response: 200,
		});

		expect(
			route.matcher({
				url: 'http://a.com',
				queryParams: new URLSearchParams(''),
			}),
		).toBe(false);
		expect(
			route.matcher({
				url: 'http://a.com',
				queryParams: new URLSearchParams('a='),
			}),
		).toBe(true);
	});

	describe('value coercion', () => {
		it('coerce integers to strings and match', () => {
			const route = new Route({
				query: {
					a: 1,
				},
				response: 200,
			});
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=1'),
				}),
			).toBe(true);
		});

		it('coerce floats to strings and match', () => {
			const route = new Route({
				query: {
					a: 1.2,
				},
				response: 200,
			});
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=1.2'),
				}),
			).toBe(true);
		});

		it('coerce booleans to strings and match', () => {
			const trueRoute = new Route({
				query: {
					a: true,
				},
				response: 200,
			});
			const falseRoute = new Route({
				query: {
					b: false,
				},
				response: 200,
			});

			expect(
				trueRoute.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				falseRoute.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				trueRoute.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=true'),
				}),
			).toBe(true);
			expect(
				falseRoute.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('b=false'),
				}),
			).toBe(true);
		});

		it('coerce undefined to an empty string and match', () => {
			const route = new Route({
				query: {
					a: undefined,
				},
				response: 200,
			});
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a='),
				}),
			).toBe(true);
		});

		it('coerce null to an empty string and match', () => {
			const route = new Route({
				query: {
					a: null,
				},
				response: 200,
			});
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a='),
				}),
			).toBe(true);
		});

		it('coerce an object to an empty string and match', () => {
			const route = new Route({
				query: {
					a: { b: 'c' },
				},
				response: 200,
			});
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a='),
				}),
			).toBe(true);
		});

		it('can match a query string with different value types', () => {
			const route = new Route({
				response: 200,
				query: {
					t: true,
					f: false,
					u: undefined,
					num: 1,
					arr: ['a', undefined],
				},
			});

			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(
						't=true&f=false&u=&num=1&arr=a&arr=',
					),
				}),
			).toBe(true);
		});
	});

	describe('repeated query strings', () => {
		it('match repeated query strings', () => {
			const route = new Route({ query: { a: ['b', 'c'] }, response: 200 });

			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b'),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b&a=c'),
				}),
			).toBe(true);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b&a=c&a=d'),
				}),
			).toBe(false);
		});

		it('match repeated query strings in any order', () => {
			const route = new Route({ query: { a: ['b', 'c'] }, response: 200 });

			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b&a=c'),
				}),
			).toBe(true);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=c&a=b'),
				}),
			).toBe(true);
		});

		it('match a query string array of length 1', () => {
			const route = new Route({ query: { a: ['b'] }, response: 200 });

			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b'),
				}),
			).toBe(true);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b&a=c'),
				}),
			).toBe(false);
		});

		it('match a repeated query string with an empty value', () => {
			const route = new Route({
				query: { a: ['b', undefined] },
				response: 200,
			});

			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b'),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b&a='),
				}),
			).toBe(true);
		});
	});

	describe('interoperability', () => {
		// TODO - this should probably throw when creating the route... or should it?
		it.skip('can be used alongside query strings expressed in the url', () => {
			const route = new Route({
				url: 'http://a.com',
				queryParams: new URLSearchParams('/?c=d'),
				response: 200,
				query: { a: 'b' },
			});

			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('c=d'),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b'),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('c=d&a=b'),
				}),
			).toBe(true);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b&c=d'),
				}),
			).toBe(true);
		});

		it('can be used alongside function matchers', () => {
			const route = new Route({
				matcher: (url) => /a\.com/.test(url),
				response: 200,
				query: { a: 'b' },
			});

			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams(''),
				}),
			).toBe(false);
			expect(
				route.matcher({
					url: 'http://a.com',
					queryParams: new URLSearchParams('a=b'),
				}),
			).toBe(true);
		});
	});
});
