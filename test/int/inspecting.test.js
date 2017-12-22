// can probably use tests very similar to existing ones
// , flush


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