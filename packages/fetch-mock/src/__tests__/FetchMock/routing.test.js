import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetchMock from '../../FetchMock';

describe('Routing', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});

	const testChainableMethod = (method, ...args) => {
		it(`${method}() is chainable`, () => {
			expect(fm[method](...args)).toEqual(fm);
		});

		it(`${method}() has "this"`, () => {
			vi.spyOn(fm, method).mockReturnThis();
			expect(fm[method](...args)).toBe(fm);
			fm[method].mockRestore();
		});
	};

	const testChainableRoutingMethod = (method, ...args) => {
		args = fetchMock[method].length === 3 ? ['*', 200] : [200];

		it(`${method}() is chainable`, () => {
			expect(fm[method](...args)).toEqual(fm);
		});

		it(`${method}() has "this"`, () => {
			vi.spyOn(fm, method).mockReturnThis();
			fm[method](...args);
			expect(fm[method](...args)).toEqual(fm);
			fm[method].mockRestore();
		});
	};

	describe('naming routes', () => {
		it('property on first parameter', () => {
			fm.route({ url: 'http://a.com', name: 'my-name' }, 200);
			expect(fm.router.routes[0].config.name).toBe('my-name');
		});

		it('property on first parameter when only one parameter supplied', () => {
			fm.route({ name: 'my-name', url: 'http://a.com', response: 200 });
			expect(fm.router.routes[0].config.name).toBe('my-name');
		});

		it('property on third parameter', () => {
			fm.route('http://a.com', 200, { name: 'my-name' });
			expect(fm.router.routes[0].config.name).toBe('my-name');
		});

		it('string in third parameter', () => {
			fm.route('http://a.com', 200, 'my-name');
			expect(fm.router.routes[0].config.name).toBe('my-name');
		});
		it('reserved names', () => {
			expect(() => fm.route('http://a.com', 200, 'matched')).toThrow(
				'fetch-mock: Routes cannot use the reserved name `matched`',
			);
			expect(() => fm.route('http://a.com', 200, 'unmatched')).toThrow(
				'fetch-mock: Routes cannot use the reserved name `unmatched`',
			);
		});
		it('error on repeated names names', () => {
			fm.route('http://a.com', 200, 'route 1');
			expect(() => fm.route('http://a.com', 200, 'route 1')).toThrow(
				'fetch-mock: Adding route with same name as existing route.',
			);
		});
	});
	describe('routing methods', () => {
		beforeEach(() => {
			fm = fetchMock.createInstance();
			vi.spyOn(fm.router, 'addRoute');
		});
		describe('FetchMock.route()', () => {
			testChainableRoutingMethod('route');
			it("won't mock if route already matched enough times", async () => {
				fm.route('http://a.com/', 200, { repeat: 1 });

				await fm.fetchHandler('http://a.com/');
				try {
					await fm.fetchHandler('http://a.com/');
					expect.unreachable('Previous line should throw');
				} catch {} // eslint-disable-line no-empty
			});
		});

		describe('FetchMock.catch()', () => {
			testChainableMethod('catch');
			describe('unmatched calls', () => {
				it('throws if any calls unmatched by default', async () => {
					fm.route('http://a.com', 200);
					await expect(fm.fetchHandler('http://b.com')).rejects.toThrow();
				});

				it('catch unmatched calls with empty 200 by default', async () => {
					fm.catch();
					await expect(fm.fetchHandler('http://a.com')).resolves.toMatchObject({
						status: 200,
					});
				});

				it('can catch unmatched calls with custom response', async () => {
					fm.catch(300);
					await expect(fm.fetchHandler('http://a.com')).resolves.toMatchObject({
						status: 300,
					});
				});

				it('can catch unmatched calls with function', async () => {
					fm.catch(() => new fm.config.Response('i am text', { status: 400 }));
					const response = await fm.fetchHandler('http://a.com');
					expect(response).toMatchObject({ status: 400 });
					await expect(response.text()).resolves.toEqual('i am text');
				});
			});
		});

		describe('FetchMock.sticky()', () => {
			it('has sticky() shorthand method', () => {
				fm.sticky('http://a.com', 'b');
				fm.sticky('http://c.com', 'd', { opt: 'e' });
				expect(fm.router.addRoute).toHaveBeenCalledWith('http://a.com', 'b', {
					sticky: true,
				});
				expect(fm.router.addRoute).toHaveBeenCalledWith('http://c.com', 'd', {
					opt: 'e',
					sticky: true,
				});
			});

			testChainableRoutingMethod('sticky');
		});
		describe('FetchMock.once()', () => {
			testChainableRoutingMethod('once');
			it('has once() shorthand method', () => {
				fm.once('http://a.com', 'b');
				fm.once('http://c.com', 'd', { opt: 'e' });
				expect(fm.router.addRoute).toHaveBeenCalledWith('http://a.com', 'b', {
					repeat: 1,
				});
				expect(fm.router.addRoute).toHaveBeenCalledWith('http://c.com', 'd', {
					opt: 'e',
					repeat: 1,
				});
			});
			it('clearHistory() resets repeat setting on routes', async () => {
				fm.once('http://a.com/', 200);
				await fm.fetchHandler('http://a.com/');
				fm.clearHistory();
				await expect(fm.fetchHandler('http://a.com/')).resolves.not.toThrow();
			});
		});

		describe('FetchMock.any()', () => {
			it('has any() shorthand method', () => {
				fm.any('http://a.com', { opt: 'b' });
				expect(fm.router.addRoute).toHaveBeenCalledWith('*', 'http://a.com', {
					opt: 'b',
				});
			});
			it('match protocol-relative urls', async () => {
				fm.any(200);
				await expect(fm.fetchHandler('//a.com/path')).resolves.not.toThrow();
			});
			testChainableRoutingMethod('any');
		});

		describe('FetchMock.anyOnce()', () => {
			it('has anyOnce() shorthand method', () => {
				fm.anyOnce('http://a.com', { opt: 'b' });
				expect(fm.router.addRoute).toHaveBeenCalledWith('*', 'http://a.com', {
					opt: 'b',
					repeat: 1,
				});
			});

			testChainableRoutingMethod('anyOnce');
		});

		describe('method shorthands', () => {
			['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
				describe(method.toUpperCase(), () => {
					it(`has ${method}() shorthand`, () => {
						fm[method]('http://a.com', 'b');
						fm[method]('http://c.com', 'd', { opt: 'e' });
						expect(fm.router.addRoute).toHaveBeenCalledWith(
							'http://a.com',
							'b',
							{
								method,
							},
						);
						expect(fm.router.addRoute).toHaveBeenCalledWith(
							'http://c.com',
							'd',
							{
								opt: 'e',
								method,
							},
						);
					});

					testChainableRoutingMethod(method);

					it(`has ${method}Once() shorthand`, () => {
						fm[`${method}Once`]('http://a.com', 'b');
						fm[`${method}Once`]('http://c.com', 'd', { opt: 'e' });
						expect(fm.router.addRoute).toHaveBeenCalledWith(
							'http://a.com',
							'b',
							{
								method,
								repeat: 1,
							},
						);
						expect(fm.router.addRoute).toHaveBeenCalledWith(
							'http://c.com',
							'd',
							{
								opt: 'e',
								method,
								repeat: 1,
							},
						);
					});

					testChainableRoutingMethod(`${method}Once`);
				});
			});
		});
	});

	describe('multiple routes', () => {
		it('match several routes with one instance', async () => {
			fm.route('http://a.com/', 200).route('http://b.com/', 201);

			const res1 = await fm.fetchHandler('http://a.com/');
			expect(res1.status).toEqual(200);
			const res2 = await fm.fetchHandler('http://b.com/');
			expect(res2.status).toEqual(201);
		});

		it('match first route that matches', async () => {
			fm.route('http://a.com/', 200).route('begin:http://a.com/', 201);

			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(200);
		});
	});
	describe('modifyRoute', () => {
		// testChainableMethod(`modifyRoute`);
		it('can modify a matcher', async () => {
			fm.route('http://a.com/', 200, 'named');
			fm.modifyRoute('named', {
				url: 'http://b.com/',
			});
			const res = await fm.fetchHandler('http://b.com/');
			expect(res.status).toEqual(200);
		});
		it('can modify a response', async () => {
			fm.route('http://a.com/', 200, 'named');
			fm.modifyRoute('named', {
				response: 201,
			});
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(201);
		});
		it('can add an option', async () => {
			fm.route('http://a.com/', 200, 'named').route('http://a.com/', 201);
			fm.modifyRoute('named', {
				headers: { a: 'a' },
			});
			const res1 = await fm.fetchHandler('http://a.com/');
			expect(res1.status).toEqual(201);
			const res2 = await fm.fetchHandler('http://a.com/', {
				headers: { a: 'a' },
			});
			expect(res2.status).toEqual(200);
		});
		it('can modify an option', async () => {
			fm.route('http://a.com/', 200, {
				name: 'named',
				headers: { a: 'a' },
			}).route('http://a.com/', 201);
			fm.modifyRoute('named', {
				headers: { a: 'b' },
			});
			const res1 = await fm.fetchHandler('http://a.com/');
			expect(res1.status).toEqual(201);
			const res2 = await fm.fetchHandler('http://a.com/', {
				headers: { a: 'a' },
			});
			expect(res2.status).toEqual(201);
			const res3 = await fm.fetchHandler('http://a.com/', {
				headers: { a: 'b' },
			});
			expect(res3.status).toEqual(200);
		});
		it('can remove an option', async () => {
			fm.route('http://a.com/', 200, {
				name: 'named',
				headers: { a: 'a' },
			}).route('http://a.com/', 201);
			fm.modifyRoute('named', {
				headers: null,
			});
			const res1 = await fm.fetchHandler('http://a.com/');
			expect(res1.status).toEqual(200);
		});
		it('errors when called on a sticky route', () => {
			fm.route('http://a.com/', 200, { name: 'named', sticky: true });
			expect(() =>
				fm.modifyRoute('named', {
					headers: null,
				}),
			).toThrow(
				'Cannot call modifyRoute() on route `named`: route is sticky and cannot be modified',
			);
		});

		it('errors when route not found', () => {
			fm.route('http://a.com/', 200, 'named');
			expect(() =>
				fm.modifyRoute('wrong name', {
					headers: null,
				}),
			).toThrow(
				'Cannot call modifyRoute() on route `wrong name`: route of that name not found',
			);
		});

		it('errors when trying to rename a route', () => {
			fm.route('http://a.com/', 200, { name: 'named' });
			expect(() =>
				fm.modifyRoute('named', {
					name: 'new name',
				}),
			).toThrow(
				'Cannot rename the route `named` as `new name`: renaming routes is not supported',
			);
		});
	});
	describe('removeRoute', () => {
		testChainableMethod(`removeRoute`);
		it.skip('error informatively when name not found', () => {
			fm.route('http://a.com/', 200).route('http://b.com/', 201, 'named');
			expect(() => fm.removeRoute('misnamed')).toThrowError(
				'Could not delete route `misnamed` - route with that name does not exist',
			);
		});
		it('deletes a route', async () => {
			fm.route('http://a.com/', 200, 'named').route('http://a.com/', 201);
			fm.removeRoute('named');
			const res = await fm.fetchHandler('http://a.com');
			expect(res.status).toEqual(201);
		});
	});
});
