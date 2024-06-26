import { describe, expect, it, beforeAll, vi } from 'vitest';

const { fetchMock } = testGlobals;
describe('FetchMockWrapper.js', () => {
	

	describe('flushing pending calls', () => {
		let fm;
		beforeAll(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});
		afterEach(() => fm.restore());

		it('flush resolves if all fetches have resolved', async () => {
			fm.route('http://one.com/', 200).route('http://two.com/', 200);
			// no expectation, but if it doesn't work then the promises will hang
			// or reject and the test will timeout
			await fm.flush();
			fetch('http://one.com');
			await fm.flush();
			fetch('http://two.com');
			await fm.flush();
		});

		it('should resolve after fetches', async () => {
			fm.route('http://example/', 'working!');
			let data;
			fetch('http://example').then(() => {
				data = 'done';
			});
			await fm.flush();
			expect(data).toEqual('done');
		});

		describe('response methods', () => {
			it('should resolve after .json() if waitForResponseMethods option passed', async () => {
				fm.route('http://example/', { a: 'ok' });
				let data;
				fetch('http://example/')
					.then((res) => res.json())
					.then(() => {
						data = 'done';
					});

				await fm.flush(true);
				expect(data).toEqual('done');
			});

			it('should resolve after .json() if waitForResponseMethods option passed', async () => {
				fm.route('http://example/', 'bleurgh');
				let data;
				fetch('http://example/')
					.then((res) => res.json())
					.catch(() => {
						data = 'done';
					});

				await fm.flush(true);
				expect(data).toEqual('done');
			});

			it('should resolve after .text() if waitForResponseMethods option passed', async () => {
				fm.route('http://example/', 'working!');
				let data;
				fetch('http://example/')
					.then((res) => res.text())
					.then(() => {
						data = 'done';
					});

				await fm.flush(true);
				expect(data).toEqual('done');
			});
		});

		it('flush waits for unresolved promises', async () => {
			fm.route('http://one.com/', 200).route(
				'http://two.com/',
				() => new Promise((res) => setTimeout(() => res(200), 50)),
			);

			const orderedResults = [];
			fetch('http://one.com/');
			fetch('http://two.com/');

			setTimeout(() => orderedResults.push('not flush'), 25);

			await fm.flush();
			orderedResults.push('flush');
			expect(orderedResults).toEqual(['not flush', 'flush']);
		});

		it('flush resolves on expected error', async () => {
			fm.route('http://one.com/', { throws: 'Problem in space' });
			await fm.flush();
		});
	});
});

import {
	afterEach,
	describe,
	expect,
	it,
	beforeAll,
	afterAll,
	vi,
} from 'vitest';

const { fetchMock } = testGlobals;
describe('Router.js', () => {


	describe('shorthands', () => {
		let fm;
		let expectRoute;

		const testChainableMethod = (method) => {
			const args = fetchMock[method].length === 3 ? ['*', 200] : [200];

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

		beforeAll(() => {
			fm = fetchMock.createInstance();
			vi.spyOn(fm, 'compileRoute');
			fm.config.warnOnUnmatched = false;
			expectRoute = (...args) =>
				expect(fm.compileRoute).toHaveBeenCalledWith(args);
		});
		afterEach(() => {
			fm.compileRoute.mockClear();
			fm.restore({ sticky: true });
		});

		afterAll(() => fm.compileRoute.mockRestore());

		it('has sticky() shorthand method', () => {
			fm.sticky('a', 'b');
			fm.sticky('c', 'd', { opt: 'e' });
			expectRoute('a', 'b', {
				sticky: true,
			});
			expectRoute('c', 'd', {
				opt: 'e',
				sticky: true,
			});
		});

		testChainableMethod('sticky');

		it('has once() shorthand method', () => {
			fm.once('a', 'b');
			fm.once('c', 'd', { opt: 'e' });
			expectRoute('a', 'b', {
				repeat: 1,
			});
			expectRoute('c', 'd', {
				opt: 'e',
				repeat: 1,
			});
		});

		testChainableMethod('once');

		it('has any() shorthand method', () => {
			fm.any('a', { opt: 'b' });
			expectRoute({}, 'a', {
				opt: 'b',
			});
		});

		testChainableMethod('any');

		it('has anyOnce() shorthand method', () => {
			fm.anyOnce('a', { opt: 'b' });
			expectRoute({}, 'a', {
				opt: 'b',
				repeat: 1,
			});
		});

		testChainableMethod('anyOnce');

		describe('method shorthands', () => {
			['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
				describe(method.toUpperCase(), () => {
					it(`has ${method}() shorthand`, () => {
						fm[method]('a', 'b');
						fm[method]('c', 'd', { opt: 'e' });
						expectRoute('a', 'b', {
							method,
						});
						expectRoute('c', 'd', {
							opt: 'e',
							method,
						});
					});

					testChainableMethod(method);

					it(`has ${method}Once() shorthand`, () => {
						fm[`${method}Once`]('a', 'b');
						fm[`${method}Once`]('c', 'd', { opt: 'e' });
						expectRoute('a', 'b', {
							method,
							repeat: 1,
						});
						expectRoute('c', 'd', {
							opt: 'e',
							method,
							repeat: 1,
						});
					});

					testChainableMethod(`${method}Once`);

					it(`has ${method}Any() shorthand`, () => {
						fm[`${method}Any`]('a', { opt: 'b' });
						expectRoute({}, 'a', {
							opt: 'b',
							method,
						});
					});

					testChainableMethod(`${method}Any`);

					it(`has ${method}AnyOnce() shorthand`, () => {
						fm[`${method}AnyOnce`]('a', { opt: 'b' });
						expectRoute({}, 'a', {
							opt: 'b',
							method,
							repeat: 1,
						});
					});

					testChainableMethod(`${method}Any`);
				});
			});
		});
	});

	import {
		afterEach,
		beforeEach,
		describe,
		expect,
		it,
		beforeAll,
		vi,
	} from 'vitest';

	const { fetchMock } = testGlobals;
	describe('Set up and tear down', () => {
		let fm;
		beforeAll(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});
		afterEach(() => fm.restore());

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

		it("won't mock if route already matched enough times", async () => {
			fm.route('http://a.com/', 200, { repeat: 1 });

			await fm.fetchHandler('http://a.com/');
			try {
				await fm.fetchHandler('http://a.com/');
				expect.unreachable('Previous line should throw');
			} catch (err) { }
		});


		describe('catch', () => {
			testChainableMethod('catch');
		});
	});


})
