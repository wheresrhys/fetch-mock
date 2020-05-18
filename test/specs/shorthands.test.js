const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

const { fetchMock } = testGlobals;
describe('shorthands', () => {
	let fm;
	let expectRoute;

	const testChainableMethod = (method) => {
		const args = fetchMock[method].length === 3 ? ['*', 200] : [200];

		it(`${method}() is chainable`, () => {
			expect(fm[method](...args)).to.equal(fm);
		});

		it(`${method}() has "this"`, () => {
			sinon.spy(fm, method);
			fm[method](...args);
			expect(fm[method].lastCall.thisValue).to.equal(fm);
			fm[method].restore();
		});
	};

	before(() => {
		fm = fetchMock.createInstance();
		sinon.spy(fm, 'compileRoute');
		fm.config.warnOnUnmatched = false;
		expectRoute = (...args) => expect(fm.compileRoute).calledWith(args);
	});
	afterEach(() => {
		fm.compileRoute.resetHistory();
		fm.restore({ sticky: true });
	});

	after(() => fm.compileRoute.restore());

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
						method: method,
					});
					expectRoute('c', 'd', {
						opt: 'e',
						method: method,
					});
				});

				testChainableMethod(method);

				it(`has ${method}Once() shorthand`, () => {
					fm[method + 'Once']('a', 'b');
					fm[method + 'Once']('c', 'd', { opt: 'e' });
					expectRoute('a', 'b', {
						method: method,
						repeat: 1,
					});
					expectRoute('c', 'd', {
						opt: 'e',
						method: method,
						repeat: 1,
					});
				});

				testChainableMethod(`${method}Once`);

				it(`has ${method}Any() shorthand`, () => {
					fm[method + 'Any']('a', { opt: 'b' });
					expectRoute({}, 'a', {
						opt: 'b',
						method: method,
					});
				});

				testChainableMethod(`${method}Any`);

				it(`has ${method}AnyOnce() shorthand`, () => {
					fm[method + 'AnyOnce']('a', { opt: 'b' });
					expectRoute({}, 'a', {
						opt: 'b',
						method: method,
						repeat: 1,
					});
				});

				testChainableMethod(`${method}Any`);
			});
		});
	});
});
