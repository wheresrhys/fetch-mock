import { describe, expect, it } from 'vitest';
import Route from '../../Route.js';

describe('body matching', () => {
	//TODO add a test for matching an asynchronous body
	it('should not match if no body provided in request', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher('http://a.com/', {
				method: 'POST',
			}),
		).toBe(false);
	});

	it('should match if no content type is specified', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher('http://a.com/', {
				method: 'POST',
				body: JSON.stringify({ foo: 'bar' }),
			}),
		).toBe(true);
	});

	it('should match when using Request', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher(
				new Request('http://a.com/', {
					method: 'POST',
					body: JSON.stringify({ foo: 'bar' }),
				}),
			),
		).toBe(true);
	});

	it('should match if body sent matches expected body', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher('http://a.com/', {
				method: 'POST',
				body: JSON.stringify({ foo: 'bar' }),
				headers: { 'Content-Type': 'application/json' },
			}),
		).toBe(true);
	});

	it('should not match if body sent doesn’t match expected body', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher('http://a.com/', {
				method: 'POST',
				body: JSON.stringify({ foo: 'woah!!!' }),
				headers: { 'Content-Type': 'application/json' },
			}),
		).toBe(false);
	});

	it('should not match if body sent isn’t JSON', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher('http://a.com/', {
				method: 'POST',
				body: new ArrayBuffer(8),
				headers: { 'Content-Type': 'application/json' },
			}),
		).toBe(false);
	});

	it('should ignore the order of the keys in the body', () => {
		const route = new Route({
			body: {
				foo: 'bar',
				baz: 'qux',
			},

			response: 200,
		});

		expect(
			route.matcher('http://a.com/', {
				method: 'POST',
				body: JSON.stringify({
					baz: 'qux',
					foo: 'bar',
				}),
				headers: { 'Content-Type': 'application/json' },
			}),
		).toBe(true);
	});

	// TODO - I think this shoudl actually throw
	it('should ignore the body option matcher if request was GET', () => {
		const route = new Route({
			body: {
				foo: 'bar',
				baz: 'qux',
			},

			response: 200,
		});

		expect(route.matcher('http://a.com/')).toBe(true);
	});

	describe('partial body matching', () => {
		it('match when missing properties', () => {
			const route = new Route({
				body: { ham: 'sandwich' },
				matchPartialBody: true,
				response: 200,
			});
			expect(
				route.matcher('http://a.com', {
					method: 'POST',
					body: JSON.stringify({ ham: 'sandwich', egg: 'mayonaise' }),
				}),
			).toBe(true);
		});

		it('match when missing nested properties', () => {
			const route = new Route({
				body: { meal: { ham: 'sandwich' } },
				matchPartialBody: true,
				response: 200,
			});
			expect(
				route.matcher('http://a.com', {
					method: 'POST',
					body: JSON.stringify({
						meal: { ham: 'sandwich', egg: 'mayonaise' },
					}),
				}),
			).toBe(true);
		});

		it('not match when properties at wrong depth', () => {
			const route = new Route({
				body: { ham: 'sandwich' },
				matchPartialBody: true,
				response: 200,
			});
			expect(
				route.matcher('http://a.com', {
					method: 'POST',
					body: JSON.stringify({ meal: { ham: 'sandwich' } }),
				}),
			).toBe(false);
		});

		it('match when starting subset of array', () => {
			const route = new Route({
				body: { ham: [1, 2] },
				matchPartialBody: true,
				response: 200,
			});
			expect(
				route.matcher('http://a.com', {
					method: 'POST',
					body: JSON.stringify({ ham: [1, 2, 3] }),
				}),
			).toBe(true);
		});

		it('not match when not starting subset of array', () => {
			const route = new Route({
				body: { ham: [1, 3] },
				matchPartialBody: true,
				response: 200,
			});
			expect(
				route.matcher('http://a.com', {
					method: 'POST',
					body: JSON.stringify({ ham: [1, 2, 3] }),
				}),
			).toBe(false);
		});
	});
});
