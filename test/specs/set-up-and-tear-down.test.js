const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = fetchMock => {
	describe('Set up and tear down', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});
		afterEach(() => fm.restore());

		describe('mock', () => {
			it('is chainable', () => {
				expect(fm.mock(/a/, 200)).to.equal(fm);
			});

			it("has 'this'", () => {
				sinon.spy(fm, 'mock');
				fm.mock(/a/, 200);
				expect(fm.mock.lastCall.thisValue).to.equal(fm);
				fm.mock.restore();
			});

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
				});

				afterEach(() => {
					fm.compileRoute.restore();
				});

				it('accepts single config object', () => {
					const config = {
						matcher: 'http://it.at.there/',
						response: 200
					};
					expect(() => fm.mock(config)).not.to.throw();
					expect(fm.compileRoute).calledWith(config);
				});

				it('accepts matcher, route pairs', () => {
					expect(() => fm.mock('http://it.at.there/', 200)).not.to.throw();
					expect(fm.compileRoute).calledWith({
						matcher: 'http://it.at.there/',
						response: 200
					});
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
				});

				it('expects a matcher', () => {
					expect(() => fm.mock(null, 'ok')).to.throw();
				});

				it('expects a response', () => {
					expect(() => fm.mock('http://it.at.there/')).to.throw();
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

				it(`shorthand for ${method.toUpperCase()} is chainable`, () => {
					const result = fm[method]('a', 'b');
					expect(result).to.equal(fm);
					fm.restore();
				});
			});
		});

		describe('reset', () => {
			it('is chainable', () => {
				expect(fm.restore()).to.equal(fm);
			});

			it("has 'this'", () => {
				sinon.spy(fm, 'restore');
				fm.restore();
				expect(fm.restore.lastCall.thisValue).to.equal(fm);
				fm.restore.restore();
			});

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
				expect(fm.restore).to.equal(fm.reset)
			})
		});

		describe('resetBehavior', () => {
			it('is chainable', () => {
				expect(fm.resetBehavior()).to.equal(fm);
			});

			it("has 'this'", () => {
				sinon.spy(fm, 'resetBehavior');
				fm.resetBehavior();
				expect(fm.resetBehavior.lastCall.thisValue).to.equal(fm);
				fm.resetBehavior.resetBehavior();
			});

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
			it('is chainable', () => {
				expect(fm.resetHistory()).to.equal(fm);
			});

			it("has 'this'", () => {
				sinon.spy(fm, 'resetHistory');
				fm.resetHistory();
				expect(fm.resetHistory.lastCall.thisValue).to.equal(fm);
				fm.resetHistory.restore();
			});

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
			it('is chainable', () => {
				expect(fm.spy()).to.equal(fm);
			});

			it("has 'this'", () => {
				sinon.spy(fm, 'spy');
				fm.spy();
				expect(fm.spy.lastCall.thisValue).to.equal(fm);
				fm.spy.restore();
			});

			it('calls catch()', () => {
				sinon.spy(fm, 'catch');
				fm.spy();
				expect(fm.catch).calledOnce;
				fm.catch.restore();
			});
		});

		describe('catch', () => {
			it('is chainable', () => {
				expect(fm.catch(200)).to.equal(fm);
			});

			it("has 'this'", () => {
				sinon.spy(fm, 'catch');
				fm.catch(200);
				expect(fm.catch.lastCall.thisValue).to.equal(fm);
				fm.catch.restore();
			});
		});
	});
};
