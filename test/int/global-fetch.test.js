// tests for changing all the config options
// tests for sandbox and global
			// it('can spy on all unmatched calls to fetch', () => {
			// 	const theFetch = theGlobal.fetch
			// 	const fetchSpy = theGlobal.fetch = sinon.spy(() => Promise.resolve());
			// 	fetchMock
			// 		.spy();

			// 	fetch('http://apples.and.pears')
			// 	expect(fetchSpy.calledWith('http://apples.and.pears')).to.be.true
			// 	expect(fetchMock.called()).to.be.true;
			// 	expect(fetchMock.calls().unmatched[0]).to.eql(['http://apples.and.pears', undefined]);
			// 	fetchMock.restore();
			// 	expect(theGlobal.fetch).to.equal(fetchSpy)
			// 	theGlobal.fetch = theFetch;

			// })

		// it('restores fetch', () => {
		// 	fetchMock.mock(/a/, 200);
		// 	fetchMock.restore();
		// 	expect(fetch).to.equal(dummyFetch);
		// 	expect(fetchMock.realFetch).to.not.exist;
		// 	expect(fetchMock.routes.length).to.equal(0)
		// 	expect(fetchMock.fallbackResponse).to.not.exist;
		// });


			it('should restore successfully after multiple mocks', () => {
				const realFetch = theGlobal.fetch;
				fetchMock
					.mock('http://foo.com', 200)
					.mock('http://foo2.com', 200)
				fetchMock.restore();
				expect(realFetch).to.equal(theGlobal.fetch);
			})