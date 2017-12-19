// all/most tests for the interface section of the last thing
// + spy, chill, reset, restore
const expect = require('chai').expect;
const sinon = require('sinon');

module.exports = (fetchMock, dummyFetch, theGlobal) => {
	describe('Set up and tear down', () => {

		// Put chainability of methods as standalone tests, just checking they return fetchMock
		// do we need dummyFetch and dmmyRoute?
		// add tests for chill
		// begin with a test that .mock can be called
		// think about it... we want to test what happens to FetchMock.fetchMock
		// - the tests in instantiation should take care of whether the mock is used
		// to overwrite the global...
		// - hmm, yes, all tests other than instantiation shouldn't call fetch,
		// they should call FM.fetchMock!!! tests for instantiation shoudl make sure
		// FM.fM is always equal to global fetch/called by sandboxed function as appropriate


		it('restores fetch', () => {
			fetchMock.mock(/a/, 200);
			fetchMock.restore();
			expect(fetch).to.equal(dummyFetch);
			expect(fetchMock.realFetch).to.not.exist;
			expect(fetchMock.routes.length).to.equal(0)
			expect(fetchMock.fallbackResponse).to.not.exist;
		});

		it('allow multiple mocking calls', () => {
			fetchMock.mock('begin:http://route1', 200);
			expect(() => {
				fetchMock.mock('begin:http://route2', 200);
			}).not.to.throw();
			fetch('http://route1.com')
			fetch('http://route2.com')
			expect(fetchMock.calls().matched.length).to.equal(2);
			fetchMock.restore();
		});

		it('mocking is chainable', () => {
			expect(() => {
				fetchMock
					.mock('begin:http://route1', 200)
					.mock('begin:http://route2', 200);
			}).not.to.throw();
			fetch('http://route1.com')
			fetch('http://route2.com')
			expect(fetchMock.calls().matched.length).to.equal(2);
			fetchMock.restore();
		});

		it('binds mock to self', () => {
			sinon.spy(fetchMock, 'mock');
			fetchMock.mock(/a/, 200);
			expect(fetchMock.mock.lastCall.thisValue).to.equal(fetchMock);
			fetchMock.mock.restore();
		});

		it('allow remocking after being restored', () => {
			fetchMock.mock(/a/, 200);
			fetchMock.restore();
			expect(() => {
				fetchMock.mock(/a/, 200);
				fetchMock.restore();
			}).not.to.throw();
		});

		it('restore is chainable', () => {
			fetchMock.mock(/a/, 200);
			expect(() => {
				fetchMock.restore().mock(/a/, 200);
			}).not.to.throw();
		});

		it('binds restore to self', () => {
			sinon.spy(fetchMock, 'restore');
			fetchMock.restore();
			expect(fetchMock.restore.lastCall.thisValue).to.equal(fetchMock);
			fetchMock.restore.restore();
		});

		it('restore can be called even if no mocks set', () => {
			expect(() => {
				fetchMock.restore();
			}).not.to.throw();
		});

		it('reset is chainable', () => {
			fetchMock.mock(/a/, 200);
			expect(() => {
				fetchMock.reset().mock(/a/, 200);
			}).not.to.throw();
		});

		it('binds reset to self', () => {
			sinon.spy(fetchMock, 'reset');
			fetchMock.reset();
			expect(fetchMock.reset.lastCall.thisValue).to.equal(fetchMock);
			fetchMock.reset.restore();
		});

		describe('catch() and spy()', () => {
			it('can catch all calls to fetch with good response by default', () => {
				fetchMock.catch();
				return fetch('http://place.com/')
					.then(res => {
						expect(res.status).to.equal(200);
						expect(fetchMock.calls().unmatched[0]).to.eql([ 'http://place.com/', undefined ])
					})
			})

			it('can catch all calls to fetch with custom response', () => {
				fetchMock.catch(Promise.resolve('carrot'));
				return fetch('http://place.com/')
					.then(res => {
						expect(res.status).to.equal(200);
						expect(fetchMock.calls().unmatched[0]).to.eql([ 'http://place.com/', undefined ])
						return res.text()
							.then(text => expect(text).to.equal('carrot'))
					})
			})

			it('can call catch after calls to mock', () => {
				fetchMock
					.mock('http://other-place.com', 404)
					.catch();
				return fetch('http://place.com/')
					.then(res => {
						expect(res.status).to.equal(200);
						expect(fetchMock.calls().unmatched[0]).to.eql([ 'http://place.com/', undefined ])
					})
			})

			it('can spy on all unmatched calls to fetch', () => {
				const theFetch = theGlobal.fetch
				const fetchSpy = theGlobal.fetch = sinon.spy(() => Promise.resolve());
				fetchMock
					.spy();

				fetch('http://apples.and.pears')
				expect(fetchSpy.calledWith('http://apples.and.pears')).to.be.true
				expect(fetchMock.called()).to.be.true;
				expect(fetchMock.calls().unmatched[0]).to.eql(['http://apples.and.pears', undefined]);
				fetchMock.restore();
				expect(theGlobal.fetch).to.equal(fetchSpy)
				theGlobal.fetch = theFetch;

			})
		});


	});
};