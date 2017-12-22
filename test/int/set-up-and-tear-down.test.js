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
		});

		describe('restore', () => {
			it('is chainable', () => {
				expect(fm.restore(/a/, 200)).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'restore');
				fm.restore(/a/, 200);
				expect(fm.restore.lastCall.thisValue).to.equal(fm);
				fm.restore.restore();
			});

			it('can be called even if no mocks set', () => {
				expect(() => fetchMock.restore()).not.to.throw();
			});
		});

		describe('reset', () => {
			it('is chainable', () => {
				expect(fm.reset(/a/, 200)).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'reset');
				fm.reset(/a/, 200);
				expect(fm.reset.lastCall.thisValue).to.equal(fm);
				fm.reset.restore();
			});
		});
		describe('spy', () => {
			it('is chainable', () => {
				expect(fm.spy(/a/, 200)).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'spy');
				fm.spy(/a/, 200);
				expect(fm.spy.lastCall.thisValue).to.equal(fm);
				fm.spy.restore();
			});
		});
		describe('catch', () => {
			it('is chainable', () => {
				expect(fm.catch(/a/, 200)).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'catch');
				fm.catch(/a/, 200);
				expect(fm.catch.lastCall.thisValue).to.equal(fm);
				fm.catch.restore();
			});
		});
		describe('chill', () => {
			it('is chainable', () => {
				expect(fm.chill(/a/, 200)).to.equal(fm);
			});

			it('has \'this\'', () => {
				sinon.spy(fm, 'chill');
				fm.chill(/a/, 200);
				expect(fm.chill.lastCall.thisValue).to.equal(fm);
				fm.chill.restore();
			});
		});

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

		it('allow remocking after being restored', () => {
			fetchMock.mock(/a/, 200);
			fetchMock.restore();
			expect(() => {
				fetchMock.mock(/a/, 200);
				fetchMock.restore();
			}).not.to.throw();
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