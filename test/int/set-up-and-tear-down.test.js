const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock) => {

	describe('Set up and tear down', () => {

		// add tests for chill
		// begin with a test that .mock can be called
		// think about it... we want to test what happens to FetchMock.fetchMock
		// - the tests in instantiation should take care of whether the mock is used
		// to overwrite the global...
		// - hmm, yes, all tests other than instantiation shouldn't call fetch,
		// they should call FM.fetchMock!!! tests for instantiation shoudl make sure
		// FM.fM is always equal to global fetch/called by sandboxed function as appropriate

		let fm;
		beforeEach(() => fm = fetchMock.createInstance());
		afterEach(() => fm.restore());

		describe('mock', () => {
			it('is chainable', () => {
				expect(fm.mock(/a/, 200)).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'mock');
				fm.mock(/a/, 200);
				expect(fm.mock.lastCall.thisValue).to.equal(fm);
				fm.mock.restore();
			});

			it('can be called multiple times', () => {
				expect(() => {
					fm
						.mock('begin:http://route1', 200)
						.mock('begin:http://route2', 200);
				}).not.to.throw();
			});

			it('can be called after fetchMock is restored', () => {
				expect(() => {
					fm
						.mock(/a/, 200)
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
					expect(fm.compileRoute)
						.calledWith(config);
				});

				it('accepts matcher, route pairs', () => {
					expect(() => fm.mock('http://it.at.there/', 200)).not.to.throw();
					expect(fm.compileRoute)
						.calledWith({matcher: 'http://it.at.there/', response: 200});
				});

				it('accepts matcher, response, config triples', () => {
					expect(() => fm.mock('http://it.at.there/', 'ok', {method: 'PUT', some: 'prop'})).not.to.throw();
					expect(fm.compileRoute)
						.calledWith({matcher: 'http://it.at.there/', response: 'ok', method: 'PUT', some: 'prop'});
				});

				it('expects a matcher', () => {
					expect(() => fm.mock(null, 'ok')).to.throw();
				});

				it('expects a response', () => {
					expect(() => fm.mock('http://it.at.there/')).to.throw();
				});

				it('REGRESSION: should accept object respones when passing options', () => {
					expect(() => fm.mock('http://foo.com', { foo: 'bar' }, { method: 'GET' })).not.to.throw();
				})
			});
		});

		describe('method shorthands', () => {
			'get,post,put,delete,head,patch'.split(',')
				.forEach(method => {
					it(`has shorthand for ${method.toUpperCase()}`, () => {
						sinon.spy(fm, 'mock');
						const result = fm[method]('a', 'b');
						expect(result).to.equal(fm);

						fm[method]('a', 'b', {opt: 'c'});
						expect(fm.mock)
							.calledWith('a', 'b', {method: method.toUpperCase()});
						expect(fm.mock)
							.calledWith('a', 'b', {opt: 'c', method: method.toUpperCase()});
						fm.mock.restore();
					});
				})
		});

		describe('restore', () => {
			it('is chainable', () => {
				expect(fm.restore()).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'restore');
				fm.restore();
				expect(fm.restore.lastCall.thisValue).to.equal(fm);
				fm.restore.restore();
			});

			it('can be called even if no mocks set', () => {
				expect(() => fm.restore()).not.to.throw();
			});

			it('calls reset', () => {
				sinon.spy(fm, 'reset');
				fm.restore();
				expect(fm.reset).calledOnce;
				fm.reset.restore();
			});

			it('removes all routing', () => {
				fm
					.mock(/a/, 200)
					.catch(200)

				expect(fm.routes.length).to.equal(1);
				expect(fm.fallbackResponse).to.exist;

				fm.restore();

				expect(fm.routes.length).to.equal(0);
				expect(fm.fallbackResponse).not.to.exist;
			});


		});

		describe('reset', () => {
			it('is chainable', () => {
				expect(fm.reset()).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'reset');
				fm.reset();
				expect(fm.reset.lastCall.thisValue).to.equal(fm);
				fm.reset.restore();
			});

			it('can be called even if no mocks set', () => {
				expect(() => fm.reset()).not.to.throw();
			});

			it('resets call history', async () => {
				fm
					.mock(/a/, 200)
					.catch(200);
				await fm.fetchHandler('a');
				await fm.fetchHandler('b');
				expect(fm.called()).to.be.true;

				fm.reset();
				expect(fm.called()).to.be.false;
				expect(fm.called('/a/')).to.be.false;
				expect(fm.calls('/a/').length).to.equal(0);
				expect(fm.calls().matched.length).to.equal(0);
				expect(fm.calls().unmatched.length).to.equal(0);
			});

		});

		describe('spy', () => {
			it('is chainable', () => {
				expect(fm.spy()).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'spy');
				fm.spy();
				expect(fm.spy.lastCall.thisValue).to.equal(fm);
				fm.spy.restore();
			});
		});

		describe('catch', () => {
			it('is chainable', () => {
				expect(fm.catch(200)).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'catch');
				fm.catch(200);
				expect(fm.catch.lastCall.thisValue).to.equal(fm);
				fm.catch.restore();
			});
		});

		describe('chill', () => {
			it('is chainable', () => {
				expect(fm.chill()).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'chill');
				fm.chill();
				expect(fm.chill.lastCall.thisValue).to.equal(fm);
				fm.chill.restore();
			});
		});
	});
};