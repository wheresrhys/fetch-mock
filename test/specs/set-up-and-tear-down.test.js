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

	describe('mock', () => {
		testChainableMethod('mock', '*', 200);

		it('can be called multiple times', () => {
			expect(() => {
				fm.mock('http://a.com', 200).mock('http://b.com', 200);
			}).not.toThrow();
		});

		it('can be called after fetchMock is restored', () => {
			expect(() => {
				fm.mock('*', 200).restore().mock('*', 200);
			}).not.toThrow();
		});

		describe('parameters', () => {
			beforeEach(() => {
				vi.spyOn(fm, 'compileRoute');
				vi.spyOn(fm, '_mock').mockReturnValue(fm);
			});

			afterEach(() => {
				fm.compileRoute.mockRestore();
				fm._mock.mockRestore();
			});

			it('accepts single config object', () => {
				const config = {
					url: '*',
					response: 200,
				};
				expect(() => fm.mock(config)).not.toThrow();
				expect(fm.compileRoute).toHaveBeenCalledWith([config]);
				expect(fm._mock).toHaveBeenCalled();
			});

			it('accepts matcher, route pairs', () => {
				expect(() => fm.mock('*', 200)).not.toThrow();
				expect(fm.compileRoute).toHaveBeenCalledWith(['*', 200]);
				expect(fm._mock).toHaveBeenCalled();
			});

			it('accepts matcher, response, config triples', () => {
				expect(() =>
					fm.mock('*', 'ok', {
						method: 'PUT',
						some: 'prop',
					})
				).not.toThrow();
				expect(fm.compileRoute).toHaveBeenCalledWith([
					'*',
					'ok',
					{
						method: 'PUT',
						some: 'prop',
					},
				]);
				expect(fm._mock).toHaveBeenCalled();
			});

			it('expects a matcher', () => {
				expect(() => fm.mock(null, 'ok')).toThrow();
			});

			it('expects a response', () => {
				expect(() => fm.mock('*')).toThrow();
			});

			it('can be called with no parameters', () => {
				expect(() => fm.mock()).not.toThrow();
				expect(fm.compileRoute).not.toHaveBeenCalled();
				expect(fm._mock).toHaveBeenCalled();
			});

			it('should accept object responses when also passing options', () => {
				expect(() =>
					fm.mock('*', { foo: 'bar' }, { method: 'GET' })
				).not.toThrow();
			});
		});
	});

	describe('reset', () => {
		testChainableMethod('reset');

		it('can be called even if no mocks set', () => {
			expect(() => fm.restore()).not.toThrow();
		});

		it('calls resetHistory', () => {
			vi.spyOn(fm, 'resetHistory');
			fm.restore();
			expect(fm.resetHistory).toHaveBeenCalledTimes(1);
			fm.resetHistory.mockRestore();
		});

		it('removes all routing', () => {
			fm.mock('*', 200).catch(200);

			expect(fm.routes.length).toEqual(1);
			expect(fm.fallbackResponse).toBeDefined();

			fm.restore();

			expect(fm.routes.length).toEqual(0);
			expect(fm.fallbackResponse).not.toBeDefined();
		});

		it('restore is an alias for reset', () => {
			expect(fm.restore).toEqual(fm.reset);
		});
	});

	describe('resetBehavior', () => {
		testChainableMethod('resetBehavior');

		it('can be called even if no mocks set', () => {
			expect(() => fm.resetBehavior()).not.toThrow();
		});

		it('removes all routing', () => {
			fm.mock('*', 200).catch(200);

			expect(fm.routes.length).toEqual(1);
			expect(fm.fallbackResponse).toBeDefined();

			fm.resetBehavior();

			expect(fm.routes.length).toEqual(0);
			expect(fm.fallbackResponse).not.toBeDefined();
		});
	});

	describe('resetHistory', () => {
		testChainableMethod('resetHistory');

		it('can be called even if no mocks set', () => {
			expect(() => fm.resetHistory()).not.toThrow();
		});

		it('resets call history', async () => {
			fm.mock('*', 200).catch(200);
			await fm.fetchHandler('a');
			await fm.fetchHandler('b');
			expect(fm.called()).to.be.true;

			fm.resetHistory();
			expect(fm.called()).to.be.false;
			expect(fm.called('*')).to.be.false;
			expect(fm.calls('*').length).toEqual(0);
			expect(fm.calls(true).length).toEqual(0);
			expect(fm.calls(false).length).toEqual(0);
			expect(fm.calls().length).toEqual(0);
		});
	});

	describe('spy', () => {
		testChainableMethod('spy');

		it('calls catch()', () => {
			vi.spyOn(fm, 'catch');
			fm.spy();
			expect(fm.catch).toHaveBeenCalledTimes(1);
			fm.catch.mockRestore();
		});
	});

	describe('catch', () => {
		testChainableMethod('catch');
	});
});
