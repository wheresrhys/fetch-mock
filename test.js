'use strict';

require('es6-promise').polyfill();

var fetchCalls = [];
var expect = require('chai').expect;
var sinon = require('sinon');

// we can't use sinon to spy on fetch in these tests as fetch-mock
// uses it internally and sinon doesn't allow spying on a previously
// stubbed function, so just use this very basic stub
var dummyFetch = GLOBAL.fetch = function () {
	fetchCalls.push([].slice.call(arguments));
	return Promise.resolve(arguments);
};


var err = function (err) {
	console.log(error);
}

var fetchMock = require('./index.js');

describe('fetch-mock', function () {

	afterEach(function () {
		fetchCalls = [];
	});

	describe('default behaviour', function () {

		it('call fetch if no routes defined', function () {
			fetchMock.mock();
			fetch();
			expect(fetchCalls.length).to.equal(1);
			fetchMock.restore();
		});

		it('restores fetch', function () {
			fetchMock.mock();
			fetchMock.restore();
			expect(fetch).to.equal(dummyFetch);
		});

		it('throw() if attempting to mock more than once', function () {
			fetchMock.mock();
			expect(function () {
				fetchMock.mock();
			}).to.throw();
			fetchMock.restore();
		});

		it('allow remocking after being restored', function () {
			fetchMock.mock();
			fetchMock.restore();
			expect(function () {
				fetchMock.mock();
				fetchMock.restore();
			}).not.to.throw();
		});

		it('turn fetch into a sinon stub', function () {
			fetchMock.mock();
			expect(typeof fetch.called).to.equal('boolean');
			fetchMock.restore();
		});

	});

	describe('mocking fetch calls', function () {

		beforeEach(function () {
			try {
				fetchMock.restore();
			} catch (e) {}
		});

		describe('api parameters', function () {

			it('accepts a single route', function () {
				expect(function () {
					fetchMock.mock({
						routes: {name: 'route', matcher: 'http://it.at.there', response: 'ok'}
					});
				}).not.to.throw();
			});

			it('accepts an array of routes', function () {
				expect(function () {
					fetchMock.mock({
						routes: [{name: 'route1', matcher: 'http://it.at.there', response: 'ok'}, {name: 'route2', matcher: 'http://it.at.there', response: 'ok'}]
					});
				}).not.to.throw();
			});

			it('expects a name', function () {
				expect(function () {
					fetchMock.mock({
						routes: {matcher: 'http://it.at.there', response: 'ok'}
					});
				}).to.throw();
			});

			it('expects a matcher', function () {
				expect(function () {
					fetchMock.mock({
						routes: {name: 'route', response: 'ok'}
					});
				}).to.throw();
			});

			it('expects a response', function () {
				expect(function () {
					fetchMock.mock({
						routes: {name: 'route', matcher: 'http://it.at.there'}
					});
				}).to.throw();
			});

			it('expects unique route names', function () {
				expect(function () {
					fetchMock.mock({
						routes: [{name: 'route', matcher: 'http://it.at.there', response: 'ok'}, {name: 'route', matcher: 'http://it.at.there', response: 'ok'}]
					});
				}).to.throw();
			});
		});

		describe('unmatched routes', function () {
			it('record history of unmatched routes', function (done) {
				fetchMock.mock();
				Promise.all([fetch('http://1', {method: 'GET'}), fetch('http://2', {method: 'POST'})])
					.then(function () {
						var unmatchedCalls = fetchMock.calls('__unmatched');
						expect(unmatchedCalls.length).to.equal(2);
						expect(unmatchedCalls[0]).to.eql(['http://1', {method: 'GET'}]);
						expect(unmatchedCalls[1]).to.eql(['http://2', {method: 'POST'}]);
						done();
					});
			});

			it('configure to send good responses', function (done) {
				fetchMock.mock({greed: 'good'});
				fetch('http://1')
					.then(function (res) {
						expect(fetchMock.calls('__unmatched').length).to.equal(1);
						expect(res.status).to.equal(200);
						res.text().then(function (text) {
							expect(text).to.equal('unmocked url: http://1');
							done();
						});
					});
			});

			it('configure to send bad responses', function (done) {
				fetchMock.mock({greed: 'bad'});
				fetch('http://1')
					.catch(function (res) {
						expect(res).to.equal('unmocked url: http://1');
						done();
					});
			});

			it('configure to pass through to native fetch', function (done) {
				fetchMock.mock({greed: 'none'});
				fetch('http://1')
					.then(function () {
						expect(fetchCalls.length).to.equal(1);
						expect(fetchCalls[0].length).to.equal(2);
						done();
					})
			});

		});

		describe('route matching', function () {
			it('match exact strings', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: 'http://it.at.there',
						response: 'ok'
					}
				});
				Promise.all([fetch('http://it.at.there'), fetch('http://it.at.thereabouts')])
					.then(function (res) {
						expect(fetchMock.calls('route').length).to.equal(1);
						expect(fetchMock.calls('__unmatched').length).to.equal(1);
						done();
					});
			});

			it('match strings starting with a string', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: '^http://it.at.there',
						response: 'ok'
					}
				});
				Promise.all([fetch('http://it.at.there'), fetch('http://it.at.thereabouts'), fetch('http://it.at.hereabouts')])
					.then(function (res) {
						expect(fetchMock.calls('route').length).to.equal(2);
						expect(fetchMock.calls('__unmatched').length).to.equal(1);
						done();
					});
			});

			it('match regular expressions', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: /http\:\/\/it\.at\.there\/\d+/,
						response: 'ok'
					}
				});
				Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.there/12345'), fetch('http://it.at.there/abcde')])
					.then(function (res) {
						expect(fetchMock.calls('route').length).to.equal(1);
						expect(fetchMock.calls('__unmatched').length).to.equal(2);
						done();
					});
			});

			it('match using custom functions', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: function (url, opts) {
							return url.indexOf('logged-in') > -1 && opts && opts.headers && opts.headers.authorized === true;
						},
						response: 'ok'
					}
				});
				Promise.all([
					fetch('http://it.at.there/logged-in', {headers:{authorized: true}}),
					fetch('http://it.at.there/12345', {headers:{authorized: true}}),
					fetch('http://it.at.there/logged-in')
				])
					.then(function (res) {
						expect(fetchMock.calls('route').length).to.equal(1);
						expect(fetchMock.calls('__unmatched').length).to.equal(2);
						done();
					});
			});

			it('match multiple routes', function (done) {
				fetchMock.mock({
					routes: [{
						name: 'route1',
						matcher: 'http://it.at.there',
						response: 'ok'
					}, {
						name: 'route2',
						matcher: 'http://it.at.here',
						response: 'ok'
					}]
				});
				Promise.all([fetch('http://it.at.there'), fetch('http://it.at.here'), fetch('http://it.at.nowhere')])
					.then(function (res) {
						expect(fetchMock.calls('route1').length).to.equal(1);
						expect(fetchMock.calls('route2').length).to.equal(1);
						expect(fetchMock.calls('__unmatched').length).to.equal(1);
						done();
					});
			});

			it('match first compatible route when many routes match', function (done) {
				fetchMock.mock({
					routes: [{
						name: 'route1',
						matcher: 'http://it.at.there',
						response: 'ok'
					}, {
						name: 'route2',
						matcher: '^http://it.at.there',
						response: 'ok'
					}]
				});
				Promise.all([fetch('http://it.at.there')])
					.then(function (res) {
						expect(fetchMock.calls('route1').length).to.equal(1);
						expect(fetchMock.calls('route2').length).to.equal(0);
						done();
					});
			});

			it('record history of calls to matched routes', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: '^http://it.at.there',
						response: 'ok'
					}
				});
				Promise.all([fetch('http://it.at.there'), fetch('http://it.at.thereabouts', {headers: {head: 'val'}})])
					.then(function (res) {
						expect(fetchMock.calls('route')[0]).to.eql(['http://it.at.there', undefined]);
						expect(fetchMock.calls('route')[1]).to.eql(['http://it.at.thereabouts', {headers: {head: 'val'}}]);
						done();
					});
			});

			it('be possible to reset call history', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: '^http://it.at.there',
						response: 'ok'
					}
				});
				fetch('http://it.at.there')
					.then(function (res) {
						fetchMock.reset();
						expect(fetchMock.calls('route').length).to.equal(0);
						done();
					});
			});

			it('restoring clears call history', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: '^http://it.at.there',
						response: 'ok'
					}
				});
				fetch('http://it.at.there')
					.then(function (res) {
						fetchMock.restore();
						expect(fetchMock.calls('route').length).to.equal(0);
						done();
					});
			});

		});

		describe('responses', function () {
			it('respond with a string', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: 'http://it.at.there',
						response: 'a string'
					}
				});
				fetch('http://it.at.there')
					.then(function (res) {
						expect(res.status).to.equal(200);
						res.text().then(function (text) {
							expect(text).to.equal('a string');
							done();
						});
					});
			});

			it('respond with a json', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: 'http://it.at.there',
						response: {an: 'object'}
					}
				});
				fetch('http://it.at.there')
					.then(function (res) {
						expect(res.status).to.equal(200);
						res.json().then(function (json) {
							expect(json).to.eql({an: 'object'});
							done();
						});
					});
			});

			it('respond with a status', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: 'http://it.at.there',
						response: {status: 404}
					}
				});
				fetch('http://it.at.there')
					.then(function (res) {
						expect(res.status).to.equal(404);
						done();
					})
					.catch(err);
			});

			it('respond with a complex response, including headers', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: 'http://it.at.there',
						response: {
							status: 202,
							body: {an: 'object'},
							headers: {
								header: 'val'
							}
						}
					}
				});
				fetch('http://it.at.there')
					.then(function (res) {
						expect(res.status).to.equal(202);
						expect(res.headers.get('header')).to.equal('val');
						res.json().then(function (json) {
							expect(json).to.eql({an: 'object'});
							done();
						});
					});
			});

			it('imitate a failed request', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: 'http://it.at.there',
						response: {
							throws: 'Oh no'
						}
					}
				});
				fetch('http://it.at.there')
					.catch(function (err) {
						expect(err).to.equal('Oh no');
						done();
					});
			});

			it('construct a response based on the request', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: 'http://it.at.there',
						response: function (url, opts) {
							return url + opts.headers.header;
						}
					}
				});
				fetch('http://it.at.there', {headers: {header: 'val'}})
					.then(function (res) {
						expect(res.status).to.equal(200);
						return res.text().then(function (text) {
							expect(text).to.equal('http://it.at.thereval');
							done();
						});
					});
			});

		});

	});

	describe('persistent route config', function () {

		beforeEach(function () {
			try {
				fetchMock.restore();
			} catch (e) {}
			fetchMock.unregisterRoute();
		});

		it('register a single route', function (done) {
			fetchMock.registerRoute('route', 'http://it.at.there', 'a string');
			fetchMock.mock();
			fetch('http://it.at.there')
				.then(function () {
					expect(fetchMock.calls('route').length).to.equal(1);
					done();
				});
		});

		it('register a single route as an object', function (done) {
			fetchMock.registerRoute({
				name: 'route',
				matcher: 'http://it.at.there',
				response: 'ok'
			});
			fetchMock.mock();
			fetch('http://it.at.there')
				.then(function () {
					expect(fetchMock.calls('route').length).to.equal(1);
					done();
				});
		});

		it('register multiple routes', function (done) {
			fetchMock.registerRoute([{
				name: 'route1',
				matcher: 'http://it.at.there',
				response: 'ok'
			}, {
				name: 'route2',
				matcher: 'http://it.at.here',
				response: 'ok'
			}]);
			fetchMock.mock();
			Promise.all([fetch('http://it.at.there'),	fetch('http://it.at.here')])
				.then(function (res) {
					expect(fetchMock.calls('route1').length).to.equal(1);
					expect(fetchMock.calls('route2').length).to.equal(1);
					done();
				});
		});

		it('expects unique route names', function () {
			expect(function () {
				fetchMock.registerRoute([{
					name: 'route',
					matcher: 'http://it.at.there',
					response: 'ok'
				}, {
					name: 'route',
					matcher: 'http://it.at.here',
					response: 'ok'
				}]);
				fetchMock();
			}).to.throw();
		});

		it('register routes multiple times', function () {
			fetchMock.registerRoute('route1', 'http://it.at.there', 'a string');
			fetchMock.registerRoute('route2', 'http://it.at.here', 'a string');
			fetchMock.mock();
			Promise.all([fetch('http://it.at.there'),	fetch('http://it.at.here')])
				.then(function (res) {
					expect(fetchMock.calls('route1').length).to.equal(1);
					expect(fetchMock.calls('route2').length).to.equal(1);
					done();
				})
		});

		it('unregister a single route', function (done) {
			fetchMock.registerRoute([{
				name: 'route1',
				matcher: 'http://it.at.there',
				response: 'ok'
			}, {
				name: 'route2',
				matcher: 'http://it.at.here',
				response: 'ok'
			}, {
				name: 'route3',
				matcher: 'http://it.at.where',
				response: 'ok'
			}]);
			fetchMock.unregisterRoute('route2');
			fetchMock.mock();
			Promise.all([fetch('http://it.at.there'),	fetch('http://it.at.here')])
				.then(function (res) {
					expect(fetchMock.calls('route1').length).to.equal(1);
					expect(fetchMock.calls('route2').length).to.equal(0);
					expect(fetchMock.calls('__unmatched').length).to.equal(1);
					done();
				});
		});

		it('unregister multiple routes', function (done) {
			fetchMock.registerRoute([{
				name: 'route1',
				matcher: 'http://it.at.there',
				response: 'ok'
			}, {
				name: 'route2',
				matcher: 'http://it.at.here',
				response: 'ok'
			}, {
				name: 'route3',
				matcher: 'http://it.at.where',
				response: 'ok'
			}]);
			fetchMock.unregisterRoute(['route1', 'route2']);
			fetchMock.mock();
			Promise.all([fetch('http://it.at.there'),	fetch('http://it.at.here'), fetch('http://it.at.where')])
				.then(function (res) {
					expect(fetchMock.calls('route3').length).to.equal(1);
					expect(fetchMock.calls('route1').length).to.equal(0);
					expect(fetchMock.calls('route2').length).to.equal(0);
					expect(fetchMock.calls('__unmatched').length).to.equal(2);
					done();
				});
		});

		it('preserve registered routes from test to test', function (done) {
			fetchMock.registerRoute('route', 'http://it.at.there', 'a string');
			fetchMock.mock();
			fetch('http://it.at.there')
				.then(function () {
					expect(fetchMock.calls('route').length).to.equal(1);
					fetchMock.restore();
					expect(fetchMock.calls('route').length).to.equal(0);
					fetchMock.mock();
					fetch('http://it.at.there')
						.then(function () {
							expect(fetchMock.calls('route').length).to.equal(1);
							fetchMock.restore();
							done();
						});
				});
		});

		it('use selection of registered routes', function (done) {
			fetchMock.registerRoute([{
				name: 'route1',
				matcher: 'http://it.at.there',
				response: 'ok'
			}, {
				name: 'route2',
				matcher: 'http://it.at.here',
				response: 'ok'
			}, {
				name: 'route3',
				matcher: 'http://it.at.where',
				response: 'ok'
			}]);
			fetchMock.mock({
				routes: ['route3', 'route1']
			});
			Promise.all([fetch('http://it.at.there'),	fetch('http://it.at.here'), fetch('http://it.at.where')])
				.then(function (res) {
					expect(fetchMock.calls('route3').length).to.equal(1);
					expect(fetchMock.calls('route1').length).to.equal(1);
					expect(fetchMock.calls('route2').length).to.equal(0);
					expect(fetchMock.calls('__unmatched').length).to.equal(1);
					done();
				});
		});

		it('mix one off routes with registered routes', function (done) {
			fetchMock.registerRoute({
				name: 'route1',
				matcher: 'http://it.at.there',
				response: 'ok'
			});
			fetchMock.mock({
				routes: [{
					name: 'route2',
					matcher: 'http://it.at.here',
					response: 'ok'
				}, 'route1']
			});
			Promise.all([fetch('http://it.at.there'),	fetch('http://it.at.here')])
				.then(function (res) {
					expect(fetchMock.calls('route2').length).to.equal(1);
					expect(fetchMock.calls('route1').length).to.equal(1);
					done();
				});
		});

		it('apply routes in specified order', function (done) {
			fetchMock.registerRoute({
				name: 'route1',
				matcher: 'http://it.at.here',
				response: 'ok'
			});
			fetchMock.mock({
				routes: [{
					name: 'route2',
					matcher: 'http://it.at.here',
					response: 'ok'
				}, 'route1']
			});
			fetch('http://it.at.here')
				.then(function (res) {
					expect(fetchMock.calls('route2').length).to.equal(1);
					expect(fetchMock.calls('route1').length).to.equal(0);
					done();
				});
		});

		it('override response for a registered route', function (done) {
			fetchMock.registerRoute({
				name: 'route1',
				matcher: 'http://it.at.here',
				response: 'ok'
			});
			fetchMock.mock({
				responses: {
					route1: 'changed my mind'
				}
			});
			fetch('http://it.at.here')
				.then(function (res) {
					res.text().then(function (text) {
						expect(text).to.equal('changed my mind');
						done();
					});

				});
		});

	});

});