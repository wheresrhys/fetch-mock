'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

module.exports = function (fetchMock, theGlobal, Request, Response) {

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

			it('binds mock to self', () => {
				sinon.spy(fetchMock, 'mock');
				fetchMock.mock(dummyRoute);
				expect(fetchMock.mock.lastCall.thisValue).to.equal(fetchMock);
				fetchMock.mock.restore();
			});

			it('allow remocking after being restored', function () {
				fetchMock.mock(dummyRoute);
				fetchMock.restore();
				expect(function () {
					fetchMock.mock(dummyRoute);
					fetchMock.restore();
				}).not.to.throw();
			});

			it('restore is chainable', function () {
				fetchMock.mock(dummyRoute);
				expect(function () {
					fetchMock.restore().mock(dummyRoute);
				}).not.to.throw();
			});

			it('binds restore to self', () => {
				sinon.spy(fetchMock, 'restore');
				fetchMock.restore();
				expect(fetchMock.restore.lastCall.thisValue).to.equal(fetchMock);
				fetchMock.restore.restore();
			});

			it('reset is chainable', function () {
				fetchMock.mock(dummyRoute);
				expect(function () {
					fetchMock.reset().mock(dummyRoute);
				}).not.to.throw();
			});

			it('binds reset to self', () => {
				sinon.spy(fetchMock, 'reset');
				fetchMock.reset();
				expect(fetchMock.reset.lastCall.thisValue).to.equal(fetchMock);
				fetchMock.reset.restore();
			});

		});

		describe('mocking fetch calls', function () {

			beforeEach(function () {
				try {
					fetchMock.restore();
				} catch (e) {}
			});

			describe('api parameters', function () {

				it('falls back to matcher.toString() as a name', function () {
					expect(function () {
						fetchMock.mock({matcher: 'http://it.at.there/', response: 'ok'});
					}).not.to.throw();
					fetch('http://it.at.there/');
					expect(fetchMock.calls('http://it.at.there/').length).to.equal(1);
				});

				it('expects a matcher', function () {
					expect(function () {
						fetchMock.mock({name: 'route', response: 'ok'});
					}).to.throw();
				});

				it('expects a response', function () {
					expect(function () {
						fetchMock.mock({name: 'route', matcher: 'http://it.at.there/'});
					}).to.throw();
				});


				it('throws helpful error matcher, method, route triples', function () {
					expect(function () {
						fetchMock.mock('http://it.at.there/', 'PUT', 'ok');
					}).to.throw(/API for method matching has changed/);
				});


				it('accepts matcher, method, route triples', function () {
					expect(function () {
						fetchMock.mock('http://it.at.there/', 'ok', {method: 'PUT'}).catch();
					}).not.to.throw();
					fetch('http://it.at.there/', {method: 'PUT'});
					fetch('http://it.at.there/', {method: 'POST'});
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
			});

			describe('unmatched routes', () => {

				it('throws if any calls unmatched', () => {
					fetchMock.mock(dummyRoute);
					expect(() => {
						fetch('http://1');
					}).to.throw;
				});

				it('can catch unmatched calls with empty 200', () => {
					fetchMock
						.catch()
						.mock(dummyRoute);
					return fetch('http://1')
						.then(function (res) {
							expect(fetchMock.called()).to.be.false;
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							expect(res.status).to.equal(200);
						});
				});

				it('can catch unmatched calls with custom response', () => {
					fetchMock
						.catch({iam: 'json'})
						.mock(dummyRoute);
					return fetch('http://1')
						.then(function (res) {
							expect(fetchMock.called()).to.be.false;
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							expect(res.status).to.equal(200);
							return res.json().then(function (json) {
								expect(json).to.eql({iam: 'json'});
							});
						});
				});

				it('can catch unmatched calls with function', () => {
					fetchMock
						.catch(() => new Response('i am text'))
						.mock(dummyRoute);
					return fetch('http://1')
						.then(function (res) {
							expect(fetchMock.called()).to.be.false;
							expect(fetchMock.calls().unmatched.length).to.equal(1);
							expect(res.status).to.equal(200);
							return res.text().then(function (text) {
								expect(text).to.equal('i am text');
							});
						});
				});


				it('record history of unmatched routes', function () {
					fetchMock
						.catch()
						.mock(dummyRoute);
					return Promise.all([
						fetch('http://1', {method: 'GET'}),
						fetch('http://2', {method: 'POST'})
					])
						.then(function () {
							expect(fetchMock.called()).to.be.false;
							const unmatchedCalls = fetchMock.calls().unmatched;
							expect(unmatchedCalls.length).to.equal(2);
							expect(unmatchedCalls[0]).to.eql(['http://1', {method: 'GET'}]);
							expect(unmatchedCalls[1]).to.eql(['http://2', {method: 'POST'}]);
						})

				});

			});

			describe('route matching', function () {
				it('match exact strings', function () {
					fetchMock
						.mock({
							name: 'route',
							matcher: 'http://it.at.there/',
							response: 'ok'
						})
						.catch();
					return Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.thereabouts')])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route').length).to.equal(1);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
						});
				});

				it('match when relative url', function () {
					fetchMock.mock({
						name: 'route',
						matcher: '/it.at.there/',
						method: 'POST',
						response: 'ok'
					})
					.catch();
					return fetch('/it.at.there/', {method: 'POST'})
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route').length).to.equal(1);
						});
				});

				it('match when Request instance', function () {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						method: 'POST',
						response: 'ok'
					}).catch();
					return fetch(new Request('http://it.at.there/', {method: 'POST'}))
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route').length).to.equal(1);
						});
				});

				it('match strings starting with a string', function () {
					fetchMock.mock({
						name: 'route',
						matcher: '^http://it.at.there',
						response: 'ok'
					}).catch();
					return Promise.all([
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
						});
				});

				it('match regular expressions', function () {
					fetchMock.mock({
						name: 'route',
						matcher: /http\:\/\/it\.at\.there\/\d+/,
						response: 'ok'
					}).catch();
					return Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.there/12345'), fetch('http://it.at.there/abcde')])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls('route').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls().unmatched.length).to.equal(2);
						});
				});

				it('match using custom functions', function () {
					fetchMock.mock({
						name: 'route',
						matcher: function (url, opts) {
							return url.indexOf('logged-in') > -1 && opts && opts.headers && opts.headers.authorized === true;
						},
						response: 'ok'
					}).catch();
					return Promise.all([
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
						});
				});

        it('match method', function () {
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
					return Promise.all([fetch('http://it.at.here/', {method: 'put'}), fetch('http://it.at.here/'), fetch('http://it.at.here/', {method: 'GET'}), fetch('http://it.at.here/', {method: 'delete'})])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.called('route2')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(2);
							expect(fetchMock.calls('route2').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(3);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
						});
        });

				it('match multiple routes', function () {
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
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.called('route2')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(1);
							expect(fetchMock.calls('route2').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(2);
							expect(fetchMock.calls().unmatched.length).to.equal(1);
						});
				});

				it('match first compatible route when many routes match', function () {
					fetchMock.mock({
							name: 'route1',
							matcher: 'http://it.at.there/',
							response: 'ok'
						}).mock({
							name: 'route2',
							matcher: '^http://it.at.there/',
							response: 'ok'
						}).catch();
					return Promise.all([fetch('http://it.at.there/')])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route1')).to.be.true;
							expect(fetchMock.calls('route1').length).to.equal(1);
							expect(fetchMock.calls().matched.length).to.equal(1);
							expect(fetchMock.calls('route2').length).to.equal(0);
						});
				});

				it('record history of calls to matched routes', function () {
					fetchMock.mock({
						name: 'route',
						matcher: '^http://it.at.there',
						response: 'ok'
					}).catch();
					return Promise.all([fetch('http://it.at.there/'), fetch('http://it.at.thereabouts', {headers: {head: 'val'}})])
						.then(function () {
							expect(fetchMock.called()).to.be.true;
							expect(fetchMock.called('route')).to.be.true;
							expect(fetchMock.calls().matched.length).to.equal(2);
							expect(fetchMock.calls('route')[0]).to.eql(['http://it.at.there/', undefined]);
							expect(fetchMock.calls('route')[1]).to.eql(['http://it.at.thereabouts', {headers: {head: 'val'}}]);
						});
				});

				it('have helpers to retrieve paramaters pf last call', function () {
					fetchMock.mock({
						name: 'route',
						matcher: '^http://it.at.there',
						response: 200
					});
					// fail gracefully
					expect(function () {
						fetchMock.lastCall();
						fetchMock.lastUrl();
						fetchMock.lastOptions();
					}).to.not.throw;
					return Promise.all([
						fetch('http://it.at.there/first', {method: 'DELETE'}),
						fetch('http://it.at.there/second', {method: 'GET'})
					])
						.then(function () {
							expect(fetchMock.lastCall('route')).to.deep.equal(['http://it.at.there/second', {method: 'GET'}]);
							expect(fetchMock.lastCall()).to.deep.equal(['http://it.at.there/second', {method: 'GET'}]);
							expect(fetchMock.lastUrl()).to.equal('http://it.at.there/second');
							expect(fetchMock.lastOptions()).to.deep.equal({method: 'GET'});
						});

				})

				it('be possible to reset call history', function () {
					fetchMock.mock({
						name: 'route',
						matcher: '^http://it.at.there/',
						response: 'ok'
					});
					return fetch('http://it.at.there/')
						.then(function () {
							fetchMock.reset();
							expect(fetchMock.called()).to.be.false;
							expect(fetchMock.called('route')).to.be.false;
							expect(fetchMock.calls('route').length).to.equal(0);
							expect(fetchMock.calls().matched.length).to.equal(0);
						});
				});

				it('restoring clears call history', function () {
					fetchMock.mock({
						name: 'route',
						matcher: '^http://it.at.there/',
						response: 'ok'
					});
					return fetch('http://it.at.there/')
						.then(function () {
							fetchMock.restore();
							expect(fetchMock.called()).to.be.false;
							expect(fetchMock.called('route')).to.be.false;
							expect(fetchMock.calls('route').length).to.equal(0);
							expect(fetchMock.calls().matched.length).to.equal(0);
						});
				});

			});

			describe('responses', function () {

				it('respond with a Response', function () {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: new Response('i am text')
					});
					return fetch('http://it.at.there/')
						.then(function (res) {
							expect(res.status).to.equal(200);
							return res.text()
								.then(text => {
									expect(text).to.equal('i am text');
								})
						});
				});

				it('respond with a generated Response', function () {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: () => new Response('i am text too')
					});
					return fetch('http://it.at.there/')
						.then(function (res) {
							expect(res.status).to.equal(200);
							return res.text()
								.then(text => {
									expect(text).to.equal('i am text too');
								})
						});
				});

				it('respond with a status', function () {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: 300
					});
					return fetch('http://it.at.there/')
						.then(function (res) {
							expect(res.status).to.equal(300);
							expect(res.statusText).to.equal('Multiple Choices');
						});
				});

				it('respond with a string', function () {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: 'a string'
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
						name: 'route',
						matcher: 'http://it.at.there/',
						response: {an: 'object'}
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
						name: 'route',
						matcher: 'http://it.at.there/',
						response: {status: 404}
					});
					return fetch('http://it.at.there/')
						.then(function (res) {
							expect(res.status).to.equal(404);
							expect(res.statusText).to.equal('Not Found');
						});
				});

				it('respond with a complex response, including headers', function () {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: {
							status: 202,
							body: {an: 'object'},
							headers: {
								header: 'val'
							}
						}
					});
					return fetch('http://it.at.there/')
						.then(function (res) {
							expect(res.status).to.equal(202);
							expect(res.headers.get('header')).to.equal('val');
							res.json().then(function (json) {
								expect(json).to.eql({an: 'object'});
							});
						});
				});

				it('imitate a failed request', function () {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: {
							throws: 'Oh no'
						}
					});
					return fetch('http://it.at.there/')
						.then(function () {return Promise.reject('Expected fetch to fail')},
							function (err) {
							expect(err).to.equal('Oh no');
						});
				});

				it('construct a response based on the request', function () {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: function (url, opts) {
							return url + opts.headers.header;
						}
					});
					return fetch('http://it.at.there/', {headers: {header: 'val'}})
						.then(function (res) {
							expect(res.status).to.equal(200);
							return res.text().then(function (text) {
								expect(text).to.equal('http://it.at.there/val');
							});
						});
				});

				it('construct a promised response based on the request', function () {
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: function (url, opts) {
							return Promise.resolve(url + opts.headers.header);
						}
					});
					return fetch('http://it.at.there/', {headers: {header: 'val'}})
						.then(function (res) {
							expect(res.status).to.equal(200);
							return res.text().then(function (text) {
								expect(text).to.equal('http://it.at.there/val');
							});
						});
				});

				it('respond with a promise of a response', function (done) {
					let resolve;
					const promise = new Promise(res => { resolve = res})
					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: promise.then(() => 200)
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

				it ('respond with a promise of a complex response', function (done) {
					let resolve;

					const promise = new Promise(res => {resolve = res})

					fetchMock.mock({
						name: 'route',
						matcher: 'http://it.at.there/',
						response: promise.then(() => function (url, opts) {
							return url + opts.headers.header;
						})
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
