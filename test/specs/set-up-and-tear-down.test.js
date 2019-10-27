const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

const testChainableMethod = (getFetchMock, method, args = []) => {
	it('is chainable', () => {
		expect(getFetchMock()[method](...args)).to.equal(getFetchMock());
	});

	it("has 'this'", () => {
		sinon.spy(getFetchMock(), method);
		getFetchMock()[method](...args);
		expect(getFetchMock()[method].lastCall.thisValue).to.equal(getFetchMock());
		getFetchMock()[method].restore();
	});
};

module.exports = fetchMock => {
	describe('Set up and tear down', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});
		afterEach(() => fm.restore());

		describe('mock', () => {
			testChainableMethod(() => fm, 'mock', [/a/, 200]);

			it('can be called multiple times', () => {
				expect(() => {
					fm.mock('begin:http://route1', 200).mock('begin:http://route2', 200);
				}).not.to.throw();
			});

			it('can be called after fetchMock is restored', () => {
				expect(() => {
					fm.mock(/a/, 200)
						.restore()
						.mock(/a/, 200);
				}).not.to.throw();
			});

			describe('parameters', () => {
				beforeEach(() => {
					sinon.stub(fm, 'compileRoute').returns({});
					sinon.stub(fm, '_mock').returns(fm);
				});

				afterEach(() => {
					fm.compileRoute.restore();
					fm._mock.restore();
				});

				it('accepts single config object', () => {
					const config = {
						matcher: 'http://it.at.there/',
						response: 200
					};
					expect(() => fm.mock(config)).not.to.throw();
					expect(fm.compileRoute).calledWith(config);
					expect(fm._mock).called;
				});

				it('accepts matcher, route pairs', () => {
					expect(() => fm.mock('http://it.at.there/', 200)).not.to.throw();
					expect(fm.compileRoute).calledWith({
						matcher: 'http://it.at.there/',
						response: 200
					});
					expect(fm._mock).called;
				});

				it('accepts matcher, response, config triples', () => {
					expect(() =>
						fm.mock('http://it.at.there/', 'ok', {
							method: 'PUT',
							some: 'prop'
						})
					).not.to.throw();
					expect(fm.compileRoute).calledWith({
						matcher: 'http://it.at.there/',
						response: 'ok',
						method: 'PUT',
						some: 'prop'
					});
					expect(fm._mock).called;
				});

				it('expects a matcher', () => {
					expect(() => fm.mock(null, 'ok')).to.throw();
				});

				it('expects a response', () => {
					expect(() => fm.mock('http://it.at.there/')).to.throw();
				});

				it('can be called with no parameters', () => {
					expect(() => fm.mock()).not.to.throw();
					expect(fm.compileRoute).not.called;
					expect(fm._mock).called;
				});

				it('REGRESSION: should accept object respones when passing options', () => {
					expect(() =>
						fm.mock('http://foo.com', { foo: 'bar' }, { method: 'GET' })
					).not.to.throw();
				});
			});
		});

		describe('method shorthands', () => {
			'get,post,put,delete,head,patch'.split(',').forEach(method => {
				testChainableMethod(() => fm, method, [/a/, 200]);

				it(`has shorthand for ${method.toUpperCase()}`, () => {
					sinon.stub(fm, 'mock');
					fm[method]('a', 'b');
					fm[method]('a', 'b', { opt: 'c' });
					expect(fm.mock).calledWith('a', 'b', {
						method: method.toUpperCase()
					});
					expect(fm.mock).calledWith('a', 'b', {
						opt: 'c',
						method: method.toUpperCase()
					});
					fm.mock.restore();
					fm.restore();
				});

				testChainableMethod(() => fm, `${method}Once`, [/a/, 200]);

				it(`has shorthand for ${method.toUpperCase()} called once`, () => {
					sinon.stub(fm, 'mock');
					fm[`${method}Once`]('a', 'b');
					fm[`${method}Once`]('a', 'b', { opt: 'c' });
					expect(fm.mock).calledWith('a', 'b', {
						method: method.toUpperCase(),
						repeat: 1
					});
					expect(fm.mock).calledWith('a', 'b', {
						opt: 'c',
						method: method.toUpperCase(),
						repeat: 1
					});
					fm.mock.restore();
					fm.restore();
				});
			});
		});

		describe('reset', () => {
			testChainableMethod(() => fm, 'reset');

			it('can be called even if no mocks set', () => {
				expect(() => fm.restore()).not.to.throw();
			});

			it('calls resetHistory', () => {
				sinon.spy(fm, 'resetHistory');
				fm.restore();
				expect(fm.resetHistory).calledOnce;
				fm.resetHistory.restore();
			});

			it('removes all routing', () => {
				fm.mock(/a/, 200).catch(200);

				expect(fm.routes.length).to.equal(1);
				expect(fm.fallbackResponse).to.exist;

				fm.restore();

				expect(fm.routes.length).to.equal(0);
				expect(fm.fallbackResponse).not.to.exist;
			});

			it('restore is an alias for reset', () => {
				expect(fm.restore).to.equal(fm.reset);
			});
		});

		describe('resetBehavior', () => {
			testChainableMethod(() => fm, 'resetBehavior');

			it('can be called even if no mocks set', () => {
				expect(() => fm.resetBehavior()).not.to.throw();
			});

			it('removes all routing', () => {
				fm.mock(/a/, 200).catch(200);

				expect(fm.routes.length).to.equal(1);
				expect(fm.fallbackResponse).to.exist;

				fm.resetBehavior();

				expect(fm.routes.length).to.equal(0);
				expect(fm.fallbackResponse).not.to.exist;
			});
		});

		describe('resetHistory', () => {
			testChainableMethod(() => fm, 'resetHistory');

			it('can be called even if no mocks set', () => {
				expect(() => fm.resetHistory()).not.to.throw();
			});

			it('resets call history', async () => {
				fm.mock(/a/, 200).catch(200);
				await fm.fetchHandler('a');
				await fm.fetchHandler('b');
				expect(fm.called()).to.be.true;

				fm.resetHistory();
				expect(fm.called()).to.be.false;
				expect(fm.called('/a/')).to.be.false;
				expect(fm.calls('/a/').length).to.equal(0);
				expect(fm.calls(true).length).to.equal(0);
				expect(fm.calls(false).length).to.equal(0);
				expect(fm.calls().length).to.equal(0);
			});
		});

		describe('spy', () => {
			testChainableMethod(() => fm, 'spy');

			it('calls catch()', () => {
				sinon.spy(fm, 'catch');
				fm.spy();
				expect(fm.catch).calledOnce;
				fm.catch.restore();
			});
		});

		describe('catch', () => {
			testChainableMethod(() => fm, 'catch');
		});
	});
};
