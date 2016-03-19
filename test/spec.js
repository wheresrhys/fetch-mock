'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

module.exports = function (fetchMock, theGlobal, Request) {

	describe('fetch-mock', function () {

		let fetchCalls = [];
		const dummyRoute = {
			matcher: /a/,
			response: 200
		};

		const dummyFetch = function () {
			fetchCalls.push([].slice.call(arguments));
			return Promise.resolve(arguments);
		};

		before(function () {
			theGlobal.fetch = fetchMock.realFetch = dummyFetch;
		})

		afterEach(function () {
			fetchCalls = [];
		});

		describe('default behaviour', function () {

			it('call fetch if no routes defined', function () {
				fetchMock.mock(dummyRoute);
				fetch('url', {prop: 'val'});
				expect(fetchCalls.length).to.equal(1);
				expect(fetchCalls[0]).to.eql(['url', {prop: 'val'}]);
				fetchMock.restore();
			});

			it('restores fetch', function () {
				fetchMock.mock(dummyRoute);
				fetchMock.restore();
				expect(fetch).to.equal(dummyFetch);
			});

			it('allow multiple mocking calls', function () {
				fetchMock.mock('^http://route1', 200);
				expect(function () {
					fetchMock.mock('^http://route2', 200);
				}).not.to.throw();
				fetch('http://route1.com')
				fetch('http://route2.com')
				expect(fetchMock.calls().matched.length).to.equal(2);
				fetchMock.restore();
			});

			it('mocking is chainable', function () {
				expect(function () {
					fetchMock
						.mock('^http://route1', 200)
						.mock('^http://route2', 200);
				}).not.to.throw();
				fetch('http://route1.com')
				fetch('http://route2.com')
				expect(fetchMock.calls().matched.length).to.equal(2);
				fetchMock.restore();
			});

			it('allow remocking after being restored', function () {
				fetchMock.mock(dummyRoute);
				fetchMock.restore();
				expect(function () {
					fetchMock.mock(dummyRoute);
					fetchMock.restore();
				}).not.to.throw();
			});

			it('have remocking helper', function () {
				fetchMock.mock('^http://route1', 200);
				let fm;
				expect(function () {
					fm = fetchMock.reMock('^http://route2', 200)
				}).not.to.throw();
				fetch('http://route1.com')
				fetch('http://route2.com')
				expect(fetchMock.calls().matched.length).to.equal(1);
				expect(fetchMock.calls().matched[0][0]).to.equal('http://route2.com');
				expect(fm).to.equal(fetchMock);
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
							routes: {name: 'route', matcher: 'http://it.at.there/', response: 'ok'}
						});
					}).not.to.throw();
				});

				it('accepts an array of routes', function () {
					expect(function () {
						fetchMock.mock({
							routes: [
								{name: 'route1', matcher: 'http://it.at.there/', response: 'ok'},
								{name: 'route2', matcher: 'http://it.at.there/', response: 'ok'}
							]
						});
					}).not.to.throw();
				});

				it('falls back to matcher.toString() as a name', function () {
					expect(function () {
						fetchMock.mock({
							routes: {matcher: 'http://it.at.there/', response: 'ok'}
						});
					}).not.to.throw();
					fetch('http://it.at.there/');
					expect(fetchMock.calls('http://it.at.there/').length).to.equal(1);
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
							routes: {name: 'route', matcher: 'http://it.at.there/'}
						});
					}).to.throw();
				});
			});

			describe('shorthand notation', function () {
				it('accepts matcher, method, route triples', function () {
					expect(function () {
						fetchMock.mock('http://it.at.there/', 'PUT', 'ok');
					}).not.to.throw();
					fetch('http://it.at.there/', {method: 'PUT'});
					expect(fetchMock.calls().matched.length).to.equal(1);
					expect(fetchMock.calls('http://it.at.there/').length).to.equal(1);
				});

				it('accepts matcher, route pairs', function () {
					expect(function () {
						fetchMock.mock('http://it.at.there/', 'ok');
					}).not.to.throw();
					fetch('http://it.at.there/');
					expect(fetchMock.calls().matched.length).to.equal(1);
					expect(fetchMock.calls('http://it.at.there/').length).to.equal(1);
				});

				it('accepts single route', function () {
					expect(function () {
						fetchMock.mock({name: 'route', matcher: 'http://it.at.there/', response: 'ok'});
					}).not.to.throw();
					fetch('http://it.at.there/');
					expect(fetchMock.calls().matched.length).to.equal(1);
					expect(fetchMock.calls('route').length).to.equal(1);
				});

				it('accepts array of routes', function () {
					expect(function () {
						fetchMock.mock([
							{name: 'route1', matcher: 'http://it.at.there/', response: 'ok'},
							{name: 'route2', matcher: 'http://it.at.where/', response: 'ok'}
						]);
					}).not.to.throw();
					fetch('http://it.at.there/');
					fetch('http://it.at.where/');
					expect(fetchMock.calls().matched.length).to.equal(2);
					expect(fetchMock.calls('route1').length).to.equal(1);
					expect(fetchMock.calls('route2').length).to.equal(1);
				});

			});

			describe('unmatched routes', function () {
				it('record history of unmatched routes', function (done) {
					fetchMock.mock(dummyRoute);
					Promise.all([
						fetch('http://1', {method: 'GET'}),
						fetch('http://2', {method: 'POST'})
					])
						.then(function () {
							expect(fetchMock.called()).to.be.false;
							const unmatchedCalls = fetchMock.calls().unmatched;
							expect(unmatchedCalls.length).to.equal(2);
							expect(unmatchedCalls[0]).to.eql(['http://1', {method: 'GET'}]);
							expect(unmatchedCalls[1]).to.eql(['http://2', {method: 'POST'}]);
							done();
						})

				});

				it('configure to send good responses', function (done) {
					fetchMock.mock({routes: dummyRoute, greed: 'good'});
					fetch('http://1')
						.then(function (res) {
							expect(fetchMock.called()).to.be.false;
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							expect(res.status).to.equal(200);
							res.text().then(function (text) {
								expect(text).to.equal('unmocked url: http://1');
								done();
							});
						});
				});

				it('configure to send bad responses', function (done) {
					fetchMock.mock({routes: dummyRoute, greed: 'bad'});
					fetch('http://1')
						.catch(function (res) {
							expect(fetchMock.called()).to.be.false;
							expect(res).to.equal('unmocked url: http://1');
							done();
						});
				});

				it('configure to pass through to native fetch', function (done) {
					fetchMock.mock({routes: dummyRoute, greed: 'none'});
					fetch('http://1')
						.then(function () {
							expect(fetchMock.called()).to.be.false;
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							expect(fetchCalls.length).to.equal(1);
							expect(fetchCalls[0].length).to.equal(2);
							done();
						});

				});

			});

			describe('route matching', function () {
				it('match exact strings', function (done) {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							response: 'ok'
						}
					});
					Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.thereabouts')])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route').length).to.equal(1);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							done();
						});
				});

				it('match when relative url', function (done) {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: '/it.at.there/',
							method: 'POST',
							response: 'ok'
						}
					});
					fetch('/it.at.there/', {method: 'POST'})
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route').length).to.equal(1);
							done();
						});
				});

				it('match when Request instance', function (done) {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							method: 'POST',
							response: 'ok'
						}
					});
					fetch(new Request('http://it.at.there/', {method: 'POST'}))
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route').length).to.equal(1);
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
					Promise.all([
						fetch('http://it.at.there'),
						fetch('http://it.at.thereabouts'),
						fetch('http://it.at.hereabouts')]
					)
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(2);
							expect(fetchMock.calls('route').length).to.equal(2);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
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
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls('route').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls().unmatched.length).to.equal(2);
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
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls('route').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls().unmatched.length).to.equal(2);
							done();
						});
				});

        it('match method', function (done) {
					fetchMock.mock({
						routes: [{
							name: 'route1',
							method: 'get',
							matcher: 'http://it.at.here/',
							response: 'ok'
						}, {
							name: 'route2',
							method: 'put',
							matcher: 'http://it.at.here/',
							response: 'ok'
						}]
					});
					Promise.all([fetch('http://it.at.here/', {method: 'put'}), fetch('http://it.at.here/'), fetch('http://it.at.here/', {method: 'GET'}), fetch('http://it.at.here/', {method: 'delete'})])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.called('route2')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(2);
							expect(fetchMock.calls('route2').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(3);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							done();
						}).catch(done);
        });

				it('match multiple routes', function (done) {
					fetchMock.mock({
						routes: [{
							name: 'route1',
							matcher: 'http://it.at.there/',
							response: 'ok'
						}, {
							name: 'route2',
							matcher: 'http://it.at.here/',
							response: 'ok'
						}]
					});
					Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.here/'), fetch('http://it.at.nowhere')])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.called('route2')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(1);
							expect(fetchMock.calls('route2').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(2);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							done();
						});
				});

				it('match first compatible route when many routes match', function (done) {
					fetchMock.mock({
						routes: [{
							name: 'route1',
							matcher: 'http://it.at.there/',
							response: 'ok'
						}, {
							name: 'route2',
							matcher: '^http://it.at.there/',
							response: 'ok'
						}]
					});
					Promise.all([fetch('http://it.at.there/')])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(1);
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
					Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.thereabouts', {headers: {head: 'val'}})])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(2);
							expect(fetchMock.calls('route')[0]).to.eql(['http://it.at.there/', undefined]);
							expect(fetchMock.calls('route')[1]).to.eql(['http://it.at.thereabouts', {headers: {head: 'val'}}]);
							done();
						});
				});

				it('have helpers to retrieve paramaters pf last call', function (done) {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: '^http://it.at.there',
							response: 200
						}
					});
					// fail gracefully
					expect(function () {
						fetchMock.lastCall();
						fetchMock.lastUrl();
						fetchMock.lastOptions();
					}).to.not.throw;
					Promise.all([
						fetch('http://it.at.there/first', {method: 'DELETE'}),
						fetch('http://it.at.there/second', {method: 'GET'})
					])
						.then(function () {
							expect(fetchMock.lastCall('route')).to.deep.equal(['http://it.at.there/second', {method: 'GET'}]);
							expect(fetchMock.lastCall()).to.deep.equal(['http://it.at.there/second', {method: 'GET'}]);
							expect(fetchMock.lastUrl()).to.equal('http://it.at.there/second');
							expect(fetchMock.lastOptions()).to.deep.equal({method: 'GET'});
							done();
						});

				})

				it('be possible to reset call history', function (done) {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: '^http://it.at.there/',
							response: 'ok'
						}
					});
					fetch('http://it.at.there/')
						.then(function () {
							fetchMock.reset();
							expect(fetchMock.called()).to.be.false;
							expect(fetchMock.called('route')).to.be.false;
							expect(fetchMock.calls('route').length).to.equal(0);
							expect(fetchMock.calls().matched.length).to.equal(0);
							done();
						});
				});

				it('restoring clears call history', function (done) {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: '^http://it.at.there/',
							response: 'ok'
						}
					});
					fetch('http://it.at.there/')
						.then(function () {
							fetchMock.restore();
							expect(fetchMock.called()).to.be.false;
							expect(fetchMock.called('route')).to.be.false;
							expect(fetchMock.calls('route').length).to.equal(0);
							expect(fetchMock.calls().matched.length).to.equal(0);
							done();
						});
				});

			});

			describe('responses', function () {

				it('respond with a status', function (done) {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							response: 300
						}
					});
					fetch('http://it.at.there/')
						.then(function (res) {
							expect(res.status).to.equal(300);
							expect(res.statusText).to.equal('Multiple Choices');
							done();
						});
				});

				it('respond with a string', function () {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							response: 'a string'
						}
					});
					return fetch('http://it.at.there/')
						.then(function (res) {
							expect(res.status).to.equal(200);
							expect(res.statusText).to.equal('OK');
							return res.text()
						})
						.then(function (text) {
							expect(text).to.equal('a string');
						});
				});

				it('respond with a json', function () {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							response: {an: 'object'}
						}
					});
					return fetch('http://it.at.there/')
						.then(function (res) {
							expect(res.status).to.equal(200);
							expect(res.statusText).to.equal('OK');
							return res.json();
						})
						.then(function (json) {
							expect(json).to.eql({an: 'object'});
						});
				});

				it('respond with a status', function () {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							response: {status: 404}
						}
					});
					return fetch('http://it.at.there/')
						.then(function (res) {
							expect(res.status).to.equal(404);
							expect(res.statusText).to.equal('Not Found');
						});
				});

				it('respond with a complex response, including headers', function (done) {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							response: {
								status: 202,
								body: {an: 'object'},
								headers: {
									header: 'val'
								}
							}
						}
					});
					fetch('http://it.at.there/')
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
							matcher: 'http://it.at.there/',
							response: {
								throws: 'Oh no'
							}
						}
					});
					fetch('http://it.at.there/')
						.catch(function (err) {
							expect(err).to.equal('Oh no');
							done();
						});
				});

				it('construct a response based on the request', function (done) {
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							response: function (url, opts) {
								return url + opts.headers.header;
							}
						}
					});
					fetch('http://it.at.there/', {headers: {header: 'val'}})
						.then(function (res) {
							expect(res.status).to.equal(200);
							return res.text().then(function (text) {
								expect(text).to.equal('http://it.at.there/val');
								done();
							});
						});
				});

				it('respond with a promise of a response', function (done) {
					let resolve;
					const promise = new Promise(res => { resolve = res})
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							response: promise.then(() => 200)
						}
					});
					const stub = sinon.spy(res => res);

					fetch('http://it.at.there/', {headers: {header: 'val'}})
						.then(stub)
						.then(function (res) {
							expect(res.status).to.equal(200);
						});

					setTimeout(() => {
						expect(stub.called).to.be.false;
						resolve();
						setTimeout(() => {
							expect(stub.called).to.be.true;
							done();
						}, 10)
					}, 10)
				});
				it('respond with a promise of a complex response', function (done) {
					let resolve;
					const promise = new Promise(res => {resolve = res})
					fetchMock.mock({
						routes: {
							name: 'route',
							matcher: 'http://it.at.there/',
							response: promise.then(() => function (url, opts) {
								return url + opts.headers.header;
							})
						}
					});
					const stub = sinon.spy(res => res);
					fetch('http://it.at.there/', {headers: {header: 'val'}})
						.then(stub)
						.then(function (res) {
							expect(res.status).to.equal(200);
							return res.text().then(function (text) {
								expect(text).to.equal('http://it.at.there/val');
							});
						});
					setTimeout(() => {
						expect(stub.called).to.be.false;
						resolve();
						setTimeout(() => {
							expect(stub.called).to.be.true;
							done();
						}, 10)
					}, 10)
				});
			});

		});

	});
}
