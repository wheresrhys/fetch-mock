// all existing router tests
// + new tests for overwriting routes
// + once, getOnce etc


	// describe('catch() and spy()', () => {
	// 		it('can catch all calls to fetch with good response by default', () => {
	// 			fetchMock.catch();
	// 			return fetch('http://place.com/')
	// 				.then(res => {
	// 					expect(res.status).to.equal(200);
	// 					expect(fetchMock.calls().unmatched[0]).to.eql([ 'http://place.com/', undefined ])
	// 				})
	// 		})

	// 		it('can catch all calls to fetch with custom response', () => {
	// 			fetchMock.catch(Promise.resolve('carrot'));
	// 			return fetch('http://place.com/')
	// 				.then(res => {
	// 					expect(res.status).to.equal(200);
	// 					expect(fetchMock.calls().unmatched[0]).to.eql([ 'http://place.com/', undefined ])
	// 					return res.text()
	// 						.then(text => expect(text).to.equal('carrot'))
	// 				})
	// 		})

	// 		it('can call catch after calls to mock', () => {
	// 			fetchMock
	// 				.mock('http://other-place.com', 404)
	// 				.catch();
	// 			return fetch('http://place.com/')
	// 				.then(res => {
	// 					expect(res.status).to.equal(200);
	// 					expect(fetchMock.calls().unmatched[0]).to.eql([ 'http://place.com/', undefined ])
	// 				})
	// 		})


	// 	});


			describe('matching routes', () => {

				it('match exact strings', () => {
					fetchMock
						.mock({
							name: 'route',
							matcher: 'http://it.at.there/',
							response: 'ok'
						})
						.catch();
					return Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.thereabouts')])
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route').length).to.equal(1);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
						});
				});

				it('match when relative url', () => {
					fetchMock.mock({
						name: 'route',
						matcher: '/it.at.there/',
						method: 'POST',
						response: 'ok'
					})
					.catch();
					return fetch('/it.at.there/', {method: 'POST'})
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route').length).to.equal(1);
						});
				});

				it('match when Request instance', () => {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						method: 'POST',
						response: 'ok'
					}).catch();
					return fetch(new Request('http://it.at.there/', {method: 'POST'}))
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route').length).to.equal(1);
						});
				});

				describe('string matcher keywords', () => {
					it('match begin: keyword', () => {
						fetchMock.mock({
							name: 'route',
							matcher: 'begin:http://it.at.there',
							response: 'ok'
						}).catch();
						return Promise.all([
							fetch('http://it.at.there'),
							fetch('http://it.at.thereabouts'),
							fetch('http://it.at.hereabouts')
						])
							.then(function () {
								expect(fetchMock.called('route')).to.be.true;
								expect(fetchMock.calls('route').length).to.equal(2);
								expect(fetchMock.calls('route')[0][0]).to.equal('http://it.at.there');
							});
					});

					it('match end: keyword', () => {
						fetchMock.mock({
							name: 'route',
							matcher: 'end:hereabouts',
							response: 'ok'
						}).catch();
						return Promise.all([
							fetch('http://it.at.there'),
							fetch('http://it.at.thereabouts'),
							fetch('http://it.at.hereabouts')
						])
							.then(function () {
								expect(fetchMock.called('route')).to.be.true;
								expect(fetchMock.calls('route').length).to.equal(2);
								expect(fetchMock.calls('route')[0][0]).to.equal('http://it.at.thereabouts');
							});
					});

					it('match glob: keyword', () => {
						fetchMock.mock({
							name: 'route',
							matcher: 'glob:/its/*/*',
							response: 'ok'
						}).catch();
						return Promise.all([
							fetch('/its/a/boy'),
							fetch('/its/a/girl'),
							fetch('/its/alive')
						])
							.then(function () {
								expect(fetchMock.called('route')).to.be.true;
								expect(fetchMock.calls('route').length).to.equal(2);
								expect(fetchMock.calls('route')[0][0]).to.equal('/its/a/boy');
							});
					});

					it('match express: keyword', () => {
						fetchMock.mock({
							name: 'route',
							matcher: 'express:/its/:word',
							response: 'ok'
						}).catch();
						return Promise.all([
							fetch('/its/a/boy'),
							fetch('/its/a/girl'),
							fetch('/its/alive')
						])
							.then(function () {
								expect(fetchMock.called('route')).to.be.true;
								expect(fetchMock.calls('route').length).to.equal(1);
								expect(fetchMock.calls('route')[0][0]).to.equal('/its/alive');
							});
					});

				});


				it('match wildcard string', () => {
					fetchMock.mock({
						name: 'route',
						matcher: '*',
						response: 'ok'
					}).catch();
					return Promise.all([
						fetch('http://it.at.there'),
						fetch('http://it.at.thereabouts'),
						fetch('http://it.at.hereabouts')]
					)
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(3);
							expect(fetchMock.calls('route').length).to.equal(3);
						});
				});

				it('match regular expressions', () => {
					fetchMock.mock({
						name: 'route',
						matcher: /http\:\/\/it\.at\.there\/\d+/,
						response: 'ok'
					}).catch();
					return Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.there/12345'), fetch('http://it.at.there/abcde')])
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls('route').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls().unmatched.length).to.equal(2);
						});
				});

				it('match using custom functions', () => {
					fetchMock.mock({
						name: 'route',
						matcher: (url, opts) => {
							return url.indexOf('logged-in') > -1 && opts && opts.headers && opts.headers.authorized === true;
						},
						response: 'ok'
					}).catch();
					return Promise.all([
						fetch('http://it.at.there/logged-in', {headers:{authorized: true}}),
						fetch('http://it.at.there/12345', {headers:{authorized: true}}),
						fetch('http://it.at.there/logged-in')
					])
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls('route').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls().unmatched.length).to.equal(2);
						});
				});

        it('match method', () => {
					fetchMock.mock({
							name: 'route1',
							method: 'get',
							matcher: 'http://it.at.here/',
							response: 'ok'
						}).mock({
							name: 'route2',
							method: 'put',
							matcher: 'http://it.at.here/',
							response: 'ok'
						}).catch();
					return Promise.all([
						fetch('http://it.at.here/', {method: 'put'}),
						fetch('http://it.at.here/'),
						fetch('http://it.at.here/', {method: 'GET'}),
						fetch('http://it.at.here/', {method: 'delete'})
					])
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.called('route2')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(2);
							expect(fetchMock.calls('route2').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(3);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
						});
        });


				it('match headers', () => {
					fetchMock.mock({
							name: 'route1',
							headers: {
								test: 'yes'
							},
							matcher: 'http://it.at.here/',
							response: 'ok'
						}).mock({
							name: 'route2',
							headers: {
								test: 'else',
								again: 'oh yes'
							},
							matcher: 'http://it.at.here/',
							response: 'ok'
						}).catch();
					return Promise.all([
						fetch('http://it.at.here/', {headers: {test: 'yes'}}),
						fetch('http://it.at.here/', {headers: {test: 'else'}}),
						fetch('http://it.at.here/', {headers: {test: 'else', AGAIN: 'oh yes'}}),
						fetch('http://it.at.here/')
					])
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.called('route2')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(1);
							expect(fetchMock.calls('route2').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(2);
							expect(fetchMock.calls().unmatched.length).to.equal(2);
						});
        });

				it('match multiple routes', () => {
					fetchMock.mock({
							name: 'route1',
							matcher: 'http://it.at.there/',
							response: 'ok'
						}).mock({
							name: 'route2',
							matcher: 'http://it.at.here/',
							response: 'ok'
						}).catch();
					return Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.here/'), fetch('http://it.at.nowhere')])
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.called('route2')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(1);
							expect(fetchMock.calls('route2').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(2);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
						});
				});

				it('match first compatible route when many routes match', () => {
					fetchMock.mock({
							name: 'route1',
							matcher: 'http://it.at.there/',
							response: 'ok'
						}).mock({
							name: 'route2',
							matcher: 'begin:http://it.at.there/',
							response: 'ok'
						}).catch();
					return Promise.all([fetch('http://it.at.there/')])
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route2').length).to.equal(0);
						});
				});

				it('falls back to matcher.toString() as a name', () => {
					expect(() => {
						fetchMock.mock({matcher: 'http://it.at.there/', response: 'ok'});
					}).not.to.throw();
					fetch('http://it.at.there/');
					expect(fetchMock.calls('http://it.at.there/').length).to.equal(1);
				});


				it('record history of calls to matched routes', () => {
					fetchMock.mock({
						name: 'route',
						matcher: 'begin:http://it.at.there',
						response: 'ok'
					}).catch();
					return Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.thereabouts', {headers: {head: 'val'}})])
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(2);
							expect(fetchMock.calls('route')[0]).to.eql(['http://it.at.there/', undefined]);
							expect(fetchMock.calls('route')[1]).to.eql(['http://it.at.thereabouts', {headers: {head: 'val'}}]);
						});
				});



			describe('unmatched routes', () => {

				it('throws if any calls unmatched', () => {
					fetchMock.mock(/a/, 200);
					expect(() => {
						fetch('http://1');
					}).to.throw;
				});

				it('can catch unmatched calls with empty 200', () => {
					fetchMock
						.catch()
						.mock(/a/, 200);
					return fetch('http://1')
						.then(res => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							expect(res.status).to.equal(200);
						});
				});

				it('can catch unmatched calls with custom response', () => {
					fetchMock
						.catch({iam: 'json'})
						.mock(/a/, 200);
					return fetch('http://1')
						.then(res => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							expect(res.status).to.equal(200);
							return res.json().then(json => {
								expect(json).to.eql({iam: 'json'});
							});
						});
				});

				it('can catch unmatched calls with function', () => {
					fetchMock
						.catch(() => new Response('i am text', {status: 200	}))
						.mock(/a/, 200);
					return fetch('http://1')
						.then(res => {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							expect(res.status).to.equal(200);
							return res.text().then(text => {
								expect(text).to.equal('i am text');
							});
						});
				});


				it('record history of unmatched routes', () => {
					fetchMock
						.catch()
						.mock(/a/, 200);
					return Promise.all([
						fetch('http://1', {method: 'GET'}),
						fetch('http://2', {method: 'POST'})
					])
						.then(() => {
							expect(fetchMock.called()).to.be.true;
							const unmatchedCalls = fetchMock.calls().unmatched;
							expect(unmatchedCalls.length).to.equal(2);
							expect(unmatchedCalls[0]).to.eql(['http://1', {method: 'GET'}]);
							expect(unmatchedCalls[1]).to.eql(['http://2', {method: 'POST'}]);
						})

				});

			});



			it('should combine function matchers with other options', () => {
				fetchMock
					.mock(url => /person/.test(url) , 301, { method: 'GET' })
					.mock(url => /person/.test(url) , 401, { method: 'POST' })

				return Promise.all([
					fetch('http://domain.com/person'),
					fetch('http://domain.com/person', {method: 'post'})
				])
					.then(responses => {
						expect(responses[0].status).to.equal(301);
						expect(responses[1].status).to.equal(401);
					})
			})



			'use strict';
const expect = require('chai').expect;

module.exports = (fetchMock, theGlobal, Headers) => {

    describe('fetch-mock', () => {

        const dummyFetch = () => Promise.resolve(arguments);

        before(() => {
            theGlobal.fetch = dummyFetch;
        })

        afterEach(() => {
            fetchMock.restore();
        })

        describe('Interface', () => {

            it('handles Headers class configuration correctly', () => {
                fetchMock.mock({
                    name: 'route1',
                    headers: {
                        test: 'yes'
                    },
                    matcher: 'http://it.at.here/',
                    response: 'ok'
                }).catch();
                return Promise.all([
                    fetch('http://it.at.here/', {headers: {test: 'yes'}}),
                    fetch('http://it.at.here/', {headers: new Headers({test: 'yes'})}),
                    fetch('http://it.at.here/')
                ])
                    .then(() => {
                        expect(fetchMock.called()).to.be.true;
                        expect(fetchMock.called('route1')).to.be.true;
                        expect(fetchMock.calls('route1').length).to.equal(2);
                        expect(fetchMock.calls().matched.length).to.equal(2);
                        expect(fetchMock.calls().unmatched.length).to.equal(1);
                    });
            });

            it('handles headers with multiple values correctly', () => {
                fetchMock.mock({
                    name: 'route1',
                    headers: {
                        test: ['foo', 'bar']
                    },
                    matcher: 'http://it.at.here/',
                    response: 'ok'
                }).catch();
                return Promise.all([
                    fetch('http://it.at.here/', {headers: {test: 'yes'}}),
                    fetch('http://it.at.here/', {headers: {test: ['foo', 'bar']}}),
                    fetch('http://it.at.here/')
                ])
                    .then(() => {
                        expect(fetchMock.called()).to.be.true;
                        expect(fetchMock.called('route1')).to.be.true;
                        expect(fetchMock.calls('route1').length).to.equal(1);
                        expect(fetchMock.calls().matched.length).to.equal(1);
                        expect(fetchMock.calls().unmatched.length).to.equal(2);
                    });
            });
        })


    });
}
