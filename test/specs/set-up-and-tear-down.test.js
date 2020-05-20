const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

const { fetchMock } = testGlobals;
describe('Set up and tear down', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});
	afterEach(() => fm.restore());

	const testChainableMethod = (method, ...args) => {
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

	describe('mock', () => {
		testChainableMethod('mock', '*', 200);

		it('can be called multiple times', () => {
			expect(() => {
				fm.mock('http://a.com', 200).mock('http://b.com', 200);
			}).not.to.throw();
		});

		it('can be called after fetchMock is restored', () => {
			expect(() => {
				fm.mock('*', 200).restore().mock('*', 200);
			}).not.to.throw();
		});

		describe('parameters', () => {
			beforeEach(() => {
				sinon.spy(fm, 'compileRoute');
				sinon.stub(fm, '_mock').returns(fm);
			});

			afterEach(() => {
				fm.compileRoute.restore();
				fm._mock.restore();
			});

			it('accepts single config object', () => {
				const config = {
					url: '*',
					response: 200,
				};
				expect(() => fm.mock(config)).not.to.throw();
				expect(fm.compileRoute).calledWith([config]);
				expect(fm._mock).called;
			});

			it('accepts matcher, route pairs', () => {
				expect(() => fm.mock('*', 200)).not.to.throw();
				expect(fm.compileRoute).calledWith(['*', 200]);
				expect(fm._mock).called;
			});

			it('accepts matcher, response, config triples', () => {
				expect(() =>
					fm.mock('*', 'ok', {
						method: 'PUT',
						some: 'prop',
					})
				).not.to.throw();
				expect(fm.compileRoute).calledWith([
					'*',
					'ok',
					{
						method: 'PUT',
						some: 'prop',
					},
				]);
				expect(fm._mock).called;
			});

			it('expects a matcher', () => {
				expect(() => fm.mock(null, 'ok')).to.throw();
			});

			it('expects a response', () => {
				expect(() => fm.mock('*')).to.throw();
			});

			it('can be called with no parameters', () => {
				expect(() => fm.mock()).not.to.throw();
				expect(fm.compileRoute).not.called;
				expect(fm._mock).called;
			});

			it('should accept object responses when also passing options', () => {
				expect(() =>
					fm.mock('*', { foo: 'bar' }, { method: 'GET' })
				).not.to.throw();
			});
		});
	});

	describe('reset', () => {
		testChainableMethod('reset');

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
			fm.mock('*', 200).catch(200);

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
		testChainableMethod('resetBehavior');

		it('can be called even if no mocks set', () => {
			expect(() => fm.resetBehavior()).not.to.throw();
		});

		it('removes all routing', () => {
			fm.mock('*', 200).catch(200);

			expect(fm.routes.length).to.equal(1);
			expect(fm.fallbackResponse).to.exist;

			fm.resetBehavior();

			expect(fm.routes.length).to.equal(0);
			expect(fm.fallbackResponse).not.to.exist;
		});
	});

	describe('resetHistory', () => {
		testChainableMethod('resetHistory');

		it('can be called even if no mocks set', () => {
			expect(() => fm.resetHistory()).not.to.throw();
		});

		it('resets call history', async () => {
			fm.mock('*', 200).catch(200);
			await fm.fetchHandler('a');
			await fm.fetchHandler('b');
			expect(fm.called()).to.be.true;

			fm.resetHistory();
			expect(fm.called()).to.be.false;
			expect(fm.called('*')).to.be.false;
			expect(fm.calls('*').length).to.equal(0);
			expect(fm.calls(true).length).to.equal(0);
			expect(fm.calls(false).length).to.equal(0);
			expect(fm.calls().length).to.equal(0);
		});
	});

	describe('spy', () => {
		testChainableMethod('spy');

		it('calls catch()', () => {
			sinon.spy(fm, 'catch');
			fm.spy();
			expect(fm.catch).calledOnce;
			fm.catch.restore();
		});
	});

	describe('catch', () => {
		testChainableMethod('catch');
	});
});
