// can probably use tests very similar to existing ones
// , flush
// write some really exhaustive tests for called, calls, etc...
// cover new case where true and false can be passed to calls and called
// + remember to test explicitly named routes
// cover case where GET, POST etc are differently named routes
// ... maybe accept method as second argument to calls, called etc
// consider case where multiple routes match.. make sure only one matcher logs calls
		// 		it('falls back to matcher.toString() as a name', () => {
		// 			expect(() => {
		// 				fm.mock({matcher: 'http://it.at.there/', response: 'ok'});
		// 			}).not.to.throw();
		// 		await fm.fetchHandler('http://it.at.there/');
		// 			expect(fm.calls('http://it.at.there/').length).to.equal(1);
		// 		});

			// 	describe('flush', () => {
			// 		it('flush resolves if all fetches have resolved', () => {
			// 			fetchMock
			// 				.mock('http://one.com', 200)
			// 				.mock('http://two.com', 200)
			// 			// no expectation, but if it doesn't work then the promises will hang
			// 			// or reject and the test will timeout
			// 			return fetchMock.flush()
			// 				.then(() => {
			// 					fetch('http://one.com')
			// 					return fetchMock.flush()
			// 				})
			// 				.then(() => {
			// 					fetch('http://two.com')
			// 					return fetchMock.flush()
			// 				})
			// 		})

			// 		it('should resolve after fetches', () => {
			// 			fetchMock.mock('http://example', 'working!')
			// 			let data;
			// 			fetch('http://example')
			// 				.then(() => data = 'done');
			// 			return fetchMock.flush()
			// 				.then(() => expect(data).to.equal('done'))
			// 		})

			// 		it('flush waits for unresolved promises', () => {
			// 			fetchMock
			// 				.mock('http://one.com', 200)
			// 				.mock('http://two.com', () => new Promise(res => setTimeout(() => res(200), 50)))
			// 			const orderedResults = []
			// 			fetch('http://one.com')
			// 			fetch('http://two.com')
			// 			setTimeout(() => orderedResults.push('not flush'), 25)
			// 			return fetchMock
			// 				.flush()
			// 				.then(() => orderedResults.push('flush'))
			// 				.then(() => expect(orderedResults).to.deep.equal(['not flush', 'flush']))
			// 		})

			// 		it('flush resolves on expected error', () => {
			// 			fetchMock
			// 				.mock('http://one.com', {throws: 'Problem in space'})
			// 			fetch('http://one.com')
			// 			return fetchMock
			// 				.flush()
			// 		})

			// 	})
			// });


				// it('have helpers to retrieve paramaters pf last call', () => {
				// 	fetchMock.mock({
				// 		name: 'route',
				// 		matcher: 'begin:http://it.at.there',
				// 		response: 200
				// 	});
				// 	// fail gracefully
				// 	expect(() => {
				// 		fetchMock.lastCall();
				// 		fetchMock.lastUrl();
				// 		fetchMock.lastOptions();
				// 	}).to.not.throw;
				// 	return Promise.all([
				// 		fetch('http://it.at.there/first', {method: 'DELETE'}),
				// 		fetch('http://it.at.there/second', {method: 'GET'})
				// 	])
				// 		.then(() => {
				// 			expect(fetchMock.lastCall('route')).to.deep.equal(['http://it.at.there/second', {method: 'GET'}]);
				// 			expect(fetchMock.lastCall()).to.deep.equal(['http://it.at.there/second', {method: 'GET'}]);
				// 			expect(fetchMock.lastUrl()).to.equal('http://it.at.there/second');
				// 			expect(fetchMock.lastOptions()).to.deep.equal({method: 'GET'});
				// 		});

				// })



			it('record history of calls to unnamed matched routes', function () {
					const fourth = function (url) { return /fourth/.test(url) };

					fetchMock
						.mock('http://it.at.there/first', 200)
						.mock('begin:http://it.at.there', 200)
						.mock(/third/, 200)
						.mock(fourth, 200)

					return Promise.all([
						fetch('http://it.at.there/first'),
						fetch('http://it.at.there/second'),
						fetch('http://it.at.here/third'),
						fetch('http://it.at.here/fourth')
					])
						.then(function () {
							expect(fetchMock.called('http://it.at.there/first')).to.be.true;
							expect(fetchMock.called('begin:http://it.at.there')).to.be.true;
							expect(fetchMock.called('/third/')).to.be.true;
							// cope with babelified and various browser quirks version of the function
							expect(Object.keys(fetchMock._calls).some(key => key === fourth.toString())).to.be.true;
						});
				});





	// 		it('record history of unmatched routes', () => {
		// 			fm
		// 				.catch()
		// 				.mock(/a/, 200);
		// 			return Promise.all([
		// 			await fm.fetchHandler('http://1', {method: 'GET'}),
		// 			await fm.fetchHandler('http://2', {method: 'POST'})
		// 			])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					const unmatchedCalls = fm.calls().unmatched;
		// 					expect(unmatchedCalls.length).to.equal(2);
		// 					expect(unmatchedCalls[0]).to.eql(['http://1', {method: 'GET'}]);
		// 					expect(unmatchedCalls[1]).to.eql(['http://2', {method: 'POST'}]);
		// 				})

		// 		});




		// 		it('record history of calls to matched routes', () => {
		// 			fm.mock({
		// 				name: 'route',
		// 				matcher: 'begin:http://it.at.there',
		// 				response: 'ok'
		// 			}).catch();
		// 			return Promise.all(await fm.fetchHandler('http://it.at.there/'),await fm.fetchHandler('http://it.at.thereabouts', {headers: {head: 'val'}})])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.called('route')).to.be.true;
		// 					expect(fm.calls().matched.length).to.equal(2);
		// 					expect(fm.calls('route')[0]).to.eql(['http://it.at.there/', undefined]);
		// 					expect(fm.calls('route')[1]).to.eql(['http://it.at.thereabouts', {headers: {head: 'val'}}]);
		// 				});
		// 		});









