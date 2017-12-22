const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

// all existing router tests
// + new tests for overwriting routes
// + once, getOnce etc

module.exports = (fetchMock, Request) => {
	describe('routing', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});
		afterEach(() => fm.restore());

		it('match exact strings', async () => {

			fm
				.mock('http://it.at.there/', 200)
				.catch();

			const [f1, f2] = await Promise.all([
				fm.fetchHandler('http://it.at.there/'),
				fm.fetchHandler('http://it.at.there/abouts'),
				fm.fetchHandler('http://it.at.the')
			]);

			expect(fm.calls('http://it.at.there/').length).to.equal(1);
			expect(fm.calls().unmatched.length).to.equal(2);
		});



		describe('string matcher keywords', () => {
			it('match begin: keyword', () => {
				fm.mock('begin:http://it.at.there', 200).catch();

				return Promise.all([
					fm.fetchHandler('http://it.at.there'),
					fm.fetchHandler('http://it.at.thereabouts'),
					fm.fetchHandler('http://it.at.hereabouts')
				])
					.then(function () {
						expect(fm.called('route')).to.be.true;
						expect(fm.calls('route').length).to.equal(2);
						expect(fm.calls('route')[0][0]).to.equal('http://it.at.there');
					});
			});

			it('match end: keyword', () => {
				fm.mock({
					name: 'route',
					matcher: 'end:hereabouts',
					response: 'ok'
				}).catch();
				return Promise.all([
					fm.fetchHandler('http://it.at.there'),
					fm.fetchHandler('http://it.at.thereabouts'),
					fm.fetchHandler('http://it.at.hereabouts')
				])
					.then(function () {
						expect(fm.called('route')).to.be.true;
						expect(fm.calls('route').length).to.equal(2);
						expect(fm.calls('route')[0][0]).to.equal('http://it.at.thereabouts');
					});
			});

			it('match glob: keyword', () => {
				fm.mock({
					name: 'route',
					matcher: 'glob:/its/*/*',
					response: 'ok'
				}).catch();
				return Promise.all([
					fm.fetchHandler('/its/a/boy'),
					fm.fetchHandler('/its/a/girl'),
					fm.fetchHandler('/its/alive')
				])
					.then(function () {
						expect(fm.called('route')).to.be.true;
						expect(fm.calls('route').length).to.equal(2);
						expect(fm.calls('route')[0][0]).to.equal('/its/a/boy');
					});
			});

			it('match express: keyword', () => {
				fm.mock({
					name: 'route',
					matcher: 'express:/its/:word',
					response: 'ok'
				}).catch();
				return Promise.all([
					fm.fetchHandler('/its/a/boy'),
					fm.fetchHandler('/its/a/girl'),
					fm.fetchHandler('/its/alive')
				])
					.then(function () {
						expect(fm.called('route')).to.be.true;
						expect(fm.calls('route').length).to.equal(1);
						expect(fm.calls('route')[0][0]).to.equal('/its/alive');
					});
			});

		});


		// 		it('match wildcard string', () => {
		// 			fm.mock({
		// 				name: 'route',
		// 				matcher: '*',
		// 				response: 'ok'
		// 			}).catch();
		// 			return Promise.all([
		// 				fm.fetchHandler('http://it.at.there'),
		// 				fm.fetchHandler('http://it.at.thereabouts'),
		// 				fm.fetchHandler('http://it.at.hereabouts')]
		// 			)
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.called('route')).to.be.true;
		// 					expect(fm.calls().matched.length).to.equal(3);
		// 					expect(fm.calls('route').length).to.equal(3);
		// 				});
		// 		});

		// 		it('match regular expressions', () => {
		// 			fm.mock({
		// 				name: 'route',
		// 				matcher: /http\:\/\/it\.at\.there\/\d+/,
		// 				response: 'ok'
		// 			}).catch();
		// 			return Promise.all([fm.fetchHandler('http://it.at.there/'), fm.fetchHandler('http://it.at.there/12345'), fm.fetchHandler('http://it.at.there/abcde')])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.called('route')).to.be.true;
		// 					expect(fm.calls('route').length).to.equal(1);
		// 					expect(fm.calls().matched.length).to.equal(1);
		// 					expect(fm.calls().unmatched.length).to.equal(2);
		// 				});
		// 		});

		// 		it('match using custom functions', () => {
		// 			fm.mock({
		// 				name: 'route',
		// 				matcher: (url, opts) => {
		// 					return url.indexOf('logged-in') > -1 && opts && opts.headers && opts.headers.authorized === true;
		// 				},
		// 				response: 'ok'
		// 			}).catch();
		// 			return Promise.all([
		// 				fm.fetchHandler('http://it.at.there/logged-in', {headers:{authorized: true}}),
		// 				fm.fetchHandler('http://it.at.there/12345', {headers:{authorized: true}}),
		// 				fm.fetchHandler('http://it.at.there/logged-in')
		// 			])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.called('route')).to.be.true;
		// 					expect(fm.calls('route').length).to.equal(1);
		// 					expect(fm.calls().matched.length).to.equal(1);
		// 					expect(fm.calls().unmatched.length).to.equal(2);
		// 				});
		// 		});

  //       it('match method', () => {
		// 			fm.mock({
		// 					name: 'route1',
		// 					method: 'get',
		// 					matcher: 'http://it.at.here/',
		// 					response: 'ok'
		// 				}).mock({
		// 					name: 'route2',
		// 					method: 'put',
		// 					matcher: 'http://it.at.here/',
		// 					response: 'ok'
		// 				}).catch();
		// 			return Promise.all([
		// 				fm.fetchHandler('http://it.at.here/', {method: 'put'}),
		// 				fm.fetchHandler('http://it.at.here/'),
		// 				fm.fetchHandler('http://it.at.here/', {method: 'GET'}),
		// 				fm.fetchHandler('http://it.at.here/', {method: 'delete'})
		// 			])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.called('route1')).to.be.true;
		// 					expect(fm.called('route2')).to.be.true;
		// 					expect(fm.calls('route1').length).to.equal(2);
		// 					expect(fm.calls('route2').length).to.equal(1);
		// 					expect(fm.calls().matched.length).to.equal(3);
		// 					expect(fm.calls().unmatched.length).to.equal(1);
		// 				});
  //       });


		// 		it('match headers', () => {
		// 			fm.mock({
		// 					name: 'route1',
		// 					headers: {
		// 						test: 'yes'
		// 					},
		// 					matcher: 'http://it.at.here/',
		// 					response: 'ok'
		// 				}).mock({
		// 					name: 'route2',
		// 					headers: {
		// 						test: 'else',
		// 						again: 'oh yes'
		// 					},
		// 					matcher: 'http://it.at.here/',
		// 					response: 'ok'
		// 				}).catch();
		// 			return Promise.all([
		// 				fm.fetchHandler('http://it.at.here/', {headers: {test: 'yes'}}),
		// 				fm.fetchHandler('http://it.at.here/', {headers: {test: 'else'}}),
		// 				fm.fetchHandler('http://it.at.here/', {headers: {test: 'else', AGAIN: 'oh yes'}}),
		// 				fm.fetchHandler('http://it.at.here/')
		// 			])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.called('route1')).to.be.true;
		// 					expect(fm.called('route2')).to.be.true;
		// 					expect(fm.calls('route1').length).to.equal(1);
		// 					expect(fm.calls('route2').length).to.equal(1);
		// 					expect(fm.calls().matched.length).to.equal(2);
		// 					expect(fm.calls().unmatched.length).to.equal(2);
		// 				});
  //       });

		// 		it('match multiple routes', () => {
		// 			fm.mock({
		// 					name: 'route1',
		// 					matcher: 'http://it.at.there/',
		// 					response: 'ok'
		// 				}).mock({
		// 					name: 'route2',
		// 					matcher: 'http://it.at.here/',
		// 					response: 'ok'
		// 				}).catch();
		// 			return Promise.all([fm.fetchHandler('http://it.at.there/'), fm.fetchHandler('http://it.at.here/'), fm.fetchHandler('http://it.at.nowhere')])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.called('route1')).to.be.true;
		// 					expect(fm.called('route2')).to.be.true;
		// 					expect(fm.calls('route1').length).to.equal(1);
		// 					expect(fm.calls('route2').length).to.equal(1);
		// 					expect(fm.calls().matched.length).to.equal(2);
		// 					expect(fm.calls().unmatched.length).to.equal(1);
		// 				});
		// 		});

		// 		it('match first compatible route when many routes match', () => {
		// 			fm.mock({
		// 					name: 'route1',
		// 					matcher: 'http://it.at.there/',
		// 					response: 'ok'
		// 				}).mock({
		// 					name: 'route2',
		// 					matcher: 'begin:http://it.at.there/',
		// 					response: 'ok'
		// 				}).catch();
		// 			return Promise.all([fm.fetchHandler('http://it.at.there/')])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.called('route1')).to.be.true;
		// 					expect(fm.calls('route1').length).to.equal(1);
		// 					expect(fm.calls().matched.length).to.equal(1);
		// 					expect(fm.calls('route2').length).to.equal(0);
		// 				});
		// 		});

		// 		it('falls back to matcher.toString() as a name', () => {
		// 			expect(() => {
		// 				fm.mock({matcher: 'http://it.at.there/', response: 'ok'});
		// 			}).not.to.throw();
		// 			fm.fetchHandler('http://it.at.there/');
		// 			expect(fm.calls('http://it.at.there/').length).to.equal(1);
		// 		});


		// 		it('record history of calls to matched routes', () => {
		// 			fm.mock({
		// 				name: 'route',
		// 				matcher: 'begin:http://it.at.there',
		// 				response: 'ok'
		// 			}).catch();
		// 			return Promise.all([fm.fetchHandler('http://it.at.there/'), fm.fetchHandler('http://it.at.thereabouts', {headers: {head: 'val'}})])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.called('route')).to.be.true;
		// 					expect(fm.calls().matched.length).to.equal(2);
		// 					expect(fm.calls('route')[0]).to.eql(['http://it.at.there/', undefined]);
		// 					expect(fm.calls('route')[1]).to.eql(['http://it.at.thereabouts', {headers: {head: 'val'}}]);
		// 				});
		// 		});


		// 	describe('unmatched routes', () => {

		// 		it('throws if any calls unmatched', () => {
		// 			fm.mock(/a/, 200);
		// 			expect(() => {
		// 				fm.fetchHandler('http://1');
		// 			}).to.throw;
		// 		});

		// 		it('can catch unmatched calls with empty 200', () => {
		// 			fm
		// 				.catch()
		// 				.mock(/a/, 200);
		// 			return fm.fetchHandler('http://1')
		// 				.then(res => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.calls().unmatched.length).to.equal(1);
		// 					expect(res.status).to.equal(200);
		// 				});
		// 		});

		// 		it('can catch unmatched calls with custom response', () => {
		// 			fm
		// 				.catch({iam: 'json'})
		// 				.mock(/a/, 200);
		// 			return fm.fetchHandler('http://1')
		// 				.then(res => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.calls().unmatched.length).to.equal(1);
		// 					expect(res.status).to.equal(200);
		// 					return res.json().then(json => {
		// 						expect(json).to.eql({iam: 'json'});
		// 					});
		// 				});
		// 		});

		// 		it('can catch unmatched calls with function', () => {
		// 			fm
		// 				.catch(() => new Response('i am text', {status: 200	}))
		// 				.mock(/a/, 200);
		// 			return fm.fetchHandler('http://1')
		// 				.then(res => {
		// 					expect(fm.called()).to.be.true;
		// 					expect(fm.calls().unmatched.length).to.equal(1);
		// 					expect(res.status).to.equal(200);
		// 					return res.text().then(text => {
		// 						expect(text).to.equal('i am text');
		// 					});
		// 				});
		// 		});


		// 		it('record history of unmatched routes', () => {
		// 			fm
		// 				.catch()
		// 				.mock(/a/, 200);
		// 			return Promise.all([
		// 				fm.fetchHandler('http://1', {method: 'GET'}),
		// 				fm.fetchHandler('http://2', {method: 'POST'})
		// 			])
		// 				.then(() => {
		// 					expect(fm.called()).to.be.true;
		// 					const unmatchedCalls = fm.calls().unmatched;
		// 					expect(unmatchedCalls.length).to.equal(2);
		// 					expect(unmatchedCalls[0]).to.eql(['http://1', {method: 'GET'}]);
		// 					expect(unmatchedCalls[1]).to.eql(['http://2', {method: 'POST'}]);
		// 				})

		// 		});

		// 	});



		// 	it('should combine function matchers with other options', () => {
		// 		fm
		// 			.mock(url => /person/.test(url) , 301, { method: 'GET' })
		// 			.mock(url => /person/.test(url) , 401, { method: 'POST' })

		// 		return Promise.all([
		// 			fm.fetchHandler('http://domain.com/person'),
		// 			fm.fetchHandler('http://domain.com/person', {method: 'post'})
		// 		])
		// 			.then(responses => {
		// 				expect(responses[0].status).to.equal(301);
		// 				expect(responses[1].status).to.equal(401);
		// 			})
		// 	})


		// describe('catch()', () => {
		// 	it('can catch all calls to fetch with good response by default', () => {
		// 		fm.catch();
		// 		return fm.fetchHandler('http://place.com/')
		// 			.then(res => {
		// 				expect(res.status).to.equal(200);
		// 				expect(fm.calls().unmatched[0]).to.eql([ 'http://place.com/', undefined ])
		// 			})
		// 	})

		// 	it('can catch all calls to fetch with custom response', () => {
		// 		fm.catch(Promise.resolve('carrot'));
		// 		return fm.fetchHandler('http://place.com/')
		// 			.then(res => {
		// 				expect(res.status).to.equal(200);
		// 				expect(fm.calls().unmatched[0]).to.eql([ 'http://place.com/', undefined ])
		// 				return res.text()
		// 					.then(text => expect(text).to.equal('carrot'))
		// 			})
		// 	})

		// 	it('can call catch after calls to mock', () => {
		// 		fm
		// 			.mock('http://other-place.com', 404)
		// 			.catch();
		// 		return fm.fetchHandler('http://place.com/')
		// 			.then(res => {
		// 				expect(res.status).to.equal(200);
		// 				expect(fm.calls().unmatched[0]).to.eql([ 'http://place.com/', undefined ])
		// 			})
		// 	})


		// });
			it('REGRESSION: match relative urls', async () => {
				fm
					.mock('/it.at.there/', 200)
					.catch();

				await fm.fetchHandler('/it.at.there/')
				expect(fm.calls('/it.at.there/').length).to.equal(1);
			});

			it('REGRESSION: match when called with Request', async () => {
				fm
					.post('http://it.at.there/', 200)
					.catch();

				await Promise.all([
					fm.fetchHandler(new Request('http://it.at.there/', {method: 'POST'})),
					fm.fetchHandler(new Request('http://it.at.there/', {method: 'GET'}))
				]);
				expect(fm.calls('http://it.at.there/').length).to.equal(1);
			});

	});
}








// module.exports = (fm, theGlobal, Headers) => {

//     describe('fetch-mock', () => {

//         const dummyFetch = () => Promise.resolve(arguments);

//         before(() => {
//             theGlobal.fetch = dummyFetch;
//         })

//         afterEach(() => {
//             fm.restore();
//         })

//         describe('Interface', () => {

//             it('handles Headers class configuration correctly', () => {
//                 fm.mock({
//                     name: 'route1',
//                     headers: {
//                         test: 'yes'
//                     },
//                     matcher: 'http://it.at.here/',
//                     response: 'ok'
//                 }).catch();
//                 return Promise.all([
//                     fm.fetchHandler('http://it.at.here/', {headers: {test: 'yes'}}),
//                     fm.fetchHandler('http://it.at.here/', {headers: new Headers({test: 'yes'})}),
//                     fm.fetchHandler('http://it.at.here/')
//                 ])
//                     .then(() => {
//                         expect(fm.called()).to.be.true;
//                         expect(fm.called('route1')).to.be.true;
//                         expect(fm.calls('route1').length).to.equal(2);
//                         expect(fm.calls().matched.length).to.equal(2);
//                         expect(fm.calls().unmatched.length).to.equal(1);
//                     });
//             });

//             it('handles headers with multiple values correctly', () => {
//                 fm.mock({
//                     name: 'route1',
//                     headers: {
//                         test: ['foo', 'bar']
//                     },
//                     matcher: 'http://it.at.here/',
//                     response: 'ok'
//                 }).catch();
//                 return Promise.all([
//                     fm.fetchHandler('http://it.at.here/', {headers: {test: 'yes'}}),
//                     fm.fetchHandler('http://it.at.here/', {headers: {test: ['foo', 'bar']}}),
//                     fm.fetchHandler('http://it.at.here/')
//                 ])
//                     .then(() => {
//                         expect(fm.called()).to.be.true;
//                         expect(fm.called('route1')).to.be.true;
//                         expect(fm.calls('route1').length).to.equal(1);
//                         expect(fm.calls().matched.length).to.equal(1);
//                         expect(fm.calls().unmatched.length).to.equal(2);
//                     });
//             });
//         })


//     });
// }
// 			// it('can spy on all unmatched calls to fetch', () => {
// 			// 	const theFetch = theGlobal.fetch
// 			// 	const fetchSpy = theGlobal.fetch = sinon.spy(() => Promise.resolve());
// 			// 	fm
// 			// 		.spy();

// 			// 	fm.fetchHandler('http://apples.and.pears')
// 			// 	expect(fetchSpy.calledWith('http://apples.and.pears')).to.be.true
// 			// 	expect(fm.called()).to.be.true;
// 			// 	expect(fm.calls().unmatched[0]).to.eql(['http://apples.and.pears', undefined]);
// 			// 	fm.restore();
// 			// 	expect(theGlobal.fetch).to.equal(fetchSpy)
// 			// 	theGlobal.fetch = theFetch;

// 			// })