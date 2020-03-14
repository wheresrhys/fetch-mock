const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

const testChainableMethod = (getFetchMock, method, args = []) => {
	it(`${method}() is chainable`, () => {
		expect(getFetchMock()[method](...args)).to.equal(getFetchMock());
	});

	it(`${method}() has "this"`, () => {
		sinon.spy(getFetchMock(), method);
		getFetchMock()[method](...args);
		expect(getFetchMock()[method].lastCall.thisValue).to.equal(getFetchMock());
		getFetchMock()[method].restore();
	});
};

module.exports = fetchMock => {
	describe('shorthands', () => {
		let fm;
		let expectRoute;
		before(() => {
			fm = fetchMock.createInstance();
			sinon.spy(fm, 'compileRoute');
			fm.config.warnOnUnmatched = false;
			expectRoute = (...args) => expect(fm.compileRoute).calledWith(args);
		});
		afterEach(() => {
			fm.compileRoute.resetHistory();
			fm.restore();
		});

		after(() => fm.compileRoute.restore());

		it('has once() shorthand method', () => {
			fm.once('a', 'b');
			fm.once('c', 'd', { opt: 'e' });
			expectRoute('a', 'b', {
				repeat: 1
			});
			expectRoute('c', 'd', {
				opt: 'e',
				repeat: 1
			});
		});

		it('has any() shorthand method', () => {
			fm.any('a', { opt: 'b' });
			expectRoute({}, 'a', {
				opt: 'b'
			});
		});

		it('has anyOnce() shorthand method', () => {
			fm.anyOnce('a', { opt: 'b' });
			expectRoute({}, 'a', {
				opt: 'b',
				repeat: 1
			});
		});

		describe('method shorthands', () => {
			['get', 'post', 'put', 'delete', 'head', 'patch'].forEach(method => {
				describe(method.toUpperCase(), () => {
					it(`has ${method}() shorthand`, () => {
						fm[method]('a', 'b');
						fm[method]('c', 'd', { opt: 'e' });
						expectRoute('a', 'b', {
							method: method
						});
						expectRoute('c', 'd', {
							opt: 'e',
							method: method
						});
					});

					testChainableMethod(() => fm, method, [/a/, 200]);

					it(`has ${method}Once() shorthand`, () => {
						fm[method + 'Once']('a', 'b');
						fm[method + 'Once']('c', 'd', { opt: 'e' });
						expectRoute('a', 'b', {
							method: method,
							repeat: 1
						});
						expectRoute('c', 'd', {
							opt: 'e',
							method: method,
							repeat: 1
						});
					});

					testChainableMethod(() => fm, `${method}Once`, [/a/, 200]);

					it(`has ${method}Any() shorthand`, () => {
						fm[method + 'Any']('a', { opt: 'b' });
						expectRoute({}, 'a', {
							opt: 'b',
							method: method
						});
					});

					testChainableMethod(() => fm, `${method}Any`, [200]);

					it(`has ${method}AnyOnce() shorthand`, () => {
						fm[method + 'AnyOnce']('a', { opt: 'b' });
						expectRoute({}, 'a', {
							opt: 'b',
							method: method,
							repeat: 1
						});
					});

					testChainableMethod(() => fm, `${method}Any`, [200]);
				});
			});
		});
	});
};
