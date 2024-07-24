import { describe, expect, it } from 'vitest';
import Route from '../../Route.js';
import Router from '../../Router.js';
import { createCallLogFromRequest } from '../../RequestUtils.js';
describe('body matching', () => {
	it('should not match if no body provided in request', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					method: 'POST',
				},
			}),
		).toBe(false);
	});

	it('should match if no content type is specified', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					method: 'POST',
					body: JSON.stringify({ foo: 'bar' }),
				},
			}),
		).toBe(true);
	});

	// Note, using Router to test this as normalization of Request to normalizedRequest
	// happens in there
	// TODO Q: Should it?
	// TODO need to split execute into 2??
	// 1. .route() (which can be used to test Routes with normalization applied up front)
	// 2. .respond()
	it('should match when using Request', async () => {
		const route = new Route({
			body: { foo: 'bar' },
			response: 200,
			Headers,
			Response,
		});
		const router = new Router({ Request, Headers }, { routes: [route] });
		const normalizedRequest = await createCallLogFromRequest(
			new Request('http://a.com/', {
				method: 'POST',
				body: JSON.stringify({ foo: 'bar' }),
			}),
			undefined,
			Request,
		);
		const response = await router.execute(normalizedRequest, normalizedRequest);
		expect(response.status).toBe(200);
	});

	it('should match if body sent matches expected body', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					method: 'POST',
					body: JSON.stringify({ foo: 'bar' }),
					headers: { 'Content-Type': 'application/json' },
				},
			}),
		).toBe(true);
	});

	it('should not match if body sent doesn’t match expected body', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					method: 'POST',
					body: JSON.stringify({ foo: 'woah!!!' }),
					headers: { 'Content-Type': 'application/json' },
				},
			}),
		).toBe(false);
	});

	it('should not match if body sent isn’t JSON', () => {
		const route = new Route({ body: { foo: 'bar' }, response: 200 });

		expect(
			route.matcher({
				url: 'http://a.com/',
				options: {
					method: 'POST',
					body: new ArrayBuffer(8),
					headers: { 'Content-Type': 'application/json' },
				},
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
			route.matcher({
				url: 'http://a.com/',
				options: {
					method: 'POST',
					body: JSON.stringify({
						baz: 'qux',
						foo: 'bar',
					}),
					headers: { 'Content-Type': 'application/json' },
				},
			}),
		).toBe(true);
	});

	// TODO - I think this shoudl actually throw
	it.skip('should ignore the body option matcher if request was GET', () => {
		const route = new Route({
			body: {
				foo: 'bar',
				baz: 'qux',
			},

			response: 200,
		});

		expect(route.matcher({ url: 'http://a.com/' })).toBe(true);
	});

	describe('partial body matching', () => {
		it('match when missing properties', () => {
			const route = new Route({
				body: { ham: 'sandwich' },
				matchPartialBody: true,
				response: 200,
			});
			expect(
				route.matcher({
					url: 'http://a.com',
					options: {
						method: 'POST',
						body: JSON.stringify({ ham: 'sandwich', egg: 'mayonaise' }),
					},
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
				route.matcher({
					url: 'http://a.com',
					options: {
						method: 'POST',
						body: JSON.stringify({
							meal: { ham: 'sandwich', egg: 'mayonaise' },
						}),
					},
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
				route.matcher({
					url: 'http://a.com',
					options: {
						method: 'POST',
						body: JSON.stringify({ meal: { ham: 'sandwich' } }),
					},
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
				route.matcher({
					url: 'http://a.com',
					options: {
						method: 'POST',
						body: JSON.stringify({ ham: [1, 2, 3] }),
					},
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
				route.matcher({
					url: 'http://a.com',
					options: {
						method: 'POST',
						body: JSON.stringify({ ham: [1, 2, 3] }),
					},
				}),
			).toBe(false);
		});
	});
});
